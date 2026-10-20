// Copia a biblioteca (bundle do navegador) e os 3 modelos usados na selfie para
// public/face-search/, com hash do conteúdo no nome: o .htaccess os serve com cache imutável.
// Uso: npm run faces:assets
import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { faceDir, root, shortHash, writeManifest } from './face-manifest.mjs';

const pkg = path.join(root, 'node_modules/@vladmandic/face-api');
// Selfie: os mesmos 3 modelos da indexação (SSD + landmarks + reconhecimento, ~12,4 MB). O Tiny Face
// Detector (190 KB) foi descartado: o recorte diferente muda o descritor e quebra a comparação.
const MODELS = ['ssd_mobilenetv1_model', 'face_landmark_68_model', 'face_recognition_model'];

await rm(path.join(faceDir, 'lib'), { recursive: true, force: true });
await rm(path.join(faceDir, 'models'), { recursive: true, force: true });
await mkdir(path.join(faceDir, 'lib'), { recursive: true });
await mkdir(path.join(faceDir, 'models'), { recursive: true });

const lib = await readFile(path.join(pkg, 'dist/face-api.js'));
const libName = `face-api.${shortHash(lib)}.js`;
await copyFile(path.join(pkg, 'dist/face-api.js'), path.join(faceDir, 'lib', libName));

// Tamanho de cada arquivo pesado: o navegador usa para mostrar o progresso da pré-carga.
const preload = [{ path: `lib/${libName}`, bytes: (await stat(path.join(faceDir, 'lib', libName))).size }];

for (const name of MODELS) {
  const weights = await readFile(path.join(pkg, 'model', `${name}.bin`));
  const binName = `${name}.${shortHash(weights)}.bin`;
  const manifest = JSON.parse(await readFile(path.join(pkg, 'model', `${name}-weights_manifest.json`), 'utf8'));
  // Cada modelo tem um único shard; o loader resolve `paths` relativo à pasta do manifest.
  manifest[0].paths = [binName];
  await copyFile(path.join(pkg, 'model', `${name}.bin`), path.join(faceDir, 'models', binName));
  await writeFile(path.join(faceDir, 'models', `${name}-weights_manifest.json`), JSON.stringify(manifest));
  preload.push({ path: `models/${binName}`, bytes: weights.length });
}

await writeManifest({ lib: `lib/${libName}`, models: 'models', preload });
console.log(`Assets faciais prontos: lib/${libName} e ${MODELS.length} modelos em public/face-search/models/.`);
