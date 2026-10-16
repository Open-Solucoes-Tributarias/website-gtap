// Gera o índice facial de cada álbum: detecta os rostos, calcula o descritor de 128 números
// e grava public/face-search/data/<álbum>.<hash>.bin + manifest.json.
//
// Uso:  npm run faces:index                    todos os álbuns
//       npm run faces:index -- x-gtap viii-gtap   só esses
//       npm run faces:index -- --force          ignora o cache por foto
//
// Fotos: lê .cache/midias/<edição>/full/<id>.webp se existir; senão baixa do servidor
// (url do public/api/galerias/<álbum>.json) para .cache/faces-src/. O resultado bruto de cada
// foto fica em .cache/faces/<álbum>/<id>.json, então reexecutar só processa fotos novas e
// ajustar MIN_SCORE/MIN_BOX é instantâneo.
import { createRequire } from 'node:module';
import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { editions } from '../src/data/editions.js';
import { describeAll } from '../src/faceSearch/describe.js';
import { packIndex } from '../src/faceSearch/format.js';
import { faceDir, root, shortHash, writeManifest } from './face-manifest.mjs';

// Rostos piores que isto geram descritores ruins e falsos positivos.
const MIN_SCORE = 0.6;
const MIN_BOX = 64; // lado menor da caixa, em pixels da foto indexada (1280–1600 px)
const DETECTION_FLOOR = 0.5; // o cache guarda tudo acima disto; MIN_SCORE filtra depois
// 2: descritor com luz normalizada (src/faceSearch/describe.js), igual ao da selfie.
// 3: redetecção no recorte com segunda tentativa (recall de 84% → ~100%).
const CACHE_VERSION = 3;

const args = process.argv.slice(2);
const force = args.includes('--force');
const wanted = args.filter((arg) => !arg.startsWith('--'));
const albums = editions.filter((edition) => !wanted.length || wanted.includes(edition.folder));
if (!albums.length) throw new Error(`Álbum desconhecido: ${wanted.join(', ')}`);

const require = createRequire(import.meta.url);
require('@tensorflow/tfjs-backend-wasm');
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');
await faceapi.tf.setBackend('wasm');
await faceapi.tf.ready();
// O backend WASM relança qualquer promessa rejeitada sem dono e derruba o processo; um rosto com alinhamento
// degenerado (rejeição interna da biblioteca) não pode abortar a indexação inteira.
process.removeAllListeners('unhandledRejection');
let ignoredRejections = 0;
process.on('unhandledRejection', () => { ignoredRejections += 1; });
const modelDir = path.join(root, 'node_modules/@vladmandic/face-api/model');
await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelDir);
await faceapi.nets.faceLandmark68Net.loadFromDisk(modelDir);
await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);

const exists = (file) => access(file).then(() => true, () => false);

async function photoBytes(edition, row) {
  const local = path.join(root, '.cache/midias', edition.editionText, 'full', `${row.id}.webp`);
  if (await exists(local)) return readFile(local);
  const cached = path.join(root, '.cache/faces-src', edition.folder, `${row.id}.webp`);
  if (await exists(cached)) return readFile(cached);
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(row.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      await mkdir(path.dirname(cached), { recursive: true });
      await writeFile(cached, bytes);
      return bytes;
    } catch (error) {
      if (attempt === 3) throw new Error(`${row.url}: ${error.message}`);
    }
  }
}

async function detect(bytes) {
  const { data, info } = await sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const found = await describeAll(faceapi, { data, width: info.width, height: info.height, channels: 3 }, { minConfidence: DETECTION_FLOOR });
  return found.map(({ score, box, descriptor }) => ({
    score: Number(score.toFixed(3)),
    box: [box.x, box.y, box.width, box.height].map(Math.round),
    descriptor: Array.from(descriptor, (value) => Number(value.toFixed(5))),
  }));
}

const summary = {};
for (const edition of albums) {
  const rows = JSON.parse(await readFile(path.join(root, 'public/api/galerias', `${edition.folder}.json`), 'utf8'));
  const cacheDir = path.join(root, '.cache/faces', edition.folder);
  await mkdir(cacheDir, { recursive: true });
  const started = Date.now();
  const detections = [];
  let processed = 0;

  for (const [position, row] of rows.entries()) {
    const cacheFile = path.join(cacheDir, `${row.id}.json`);
    // Cache truncado (processo interrompido no meio da escrita) conta como ausente.
    let entry = null;
    if (!force && await exists(cacheFile)) {
      try {
        entry = JSON.parse(await readFile(cacheFile, 'utf8'));
      } catch { /* refaz a foto */ }
    }
    if (entry?.v !== CACHE_VERSION) {
      entry = { v: CACHE_VERSION, faces: await detect(await photoBytes(edition, row)) };
      await writeFile(cacheFile, JSON.stringify(entry));
      processed += 1;
    }
    detections.push({ id: row.id, faces: entry.faces });
    if ((position + 1) % 25 === 0 || position + 1 === rows.length) {
      console.log(`  ${edition.editionText}: ${position + 1}/${rows.length} fotos`);
    }
  }

  const photos = [];
  const faces = [];
  const withoutFaces = [];
  for (const { id, faces: found } of detections) {
    const kept = found.filter((face) => face.score >= MIN_SCORE && Math.min(face.box[2], face.box[3]) >= MIN_BOX);
    if (!kept.length) {
      withoutFaces.push(id);
      continue;
    }
    photos.push(id);
    for (const face of kept) faces.push({ photo: photos.length - 1, descriptor: face.descriptor });
  }

  const bytes = packIndex(faces);
  const file = `data/${edition.folder}.${shortHash(bytes)}.bin`;
  await mkdir(path.join(faceDir, 'data'), { recursive: true });
  for (const old of await readdir(path.join(faceDir, 'data'))) {
    if (old.startsWith(`${edition.folder}.`) && old.endsWith('.bin')) await rm(path.join(faceDir, 'data', old));
  }
  await writeFile(path.join(faceDir, file), bytes);
  await writeManifest({ albums: { [edition.folder]: { file, faces: faces.length, photos } } });

  summary[edition.editionText] = { photos: rows.length, withFaces: photos.length, faces: faces.length, kb: Math.round(bytes.byteLength / 1024) };
  console.log(`${edition.editionText}: ${faces.length} rostos em ${photos.length}/${rows.length} fotos, ${(bytes.byteLength / 1024).toFixed(1)} KB (${processed} novas, ${Math.round((Date.now() - started) / 1000)} s)`);
  if (withoutFaces.length) console.log(`  sem rosto aproveitável: ${withoutFaces.length} (${withoutFaces.slice(0, 8).join(', ')}${withoutFaces.length > 8 ? '…' : ''})`);
}
console.table(summary);
if (ignoredRejections) console.log(`Rejeições internas ignoradas (rosto sem alinhamento válido): ${ignoredRejections}`);
