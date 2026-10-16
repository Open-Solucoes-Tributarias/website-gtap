// Copia a biblioteca (bundle do navegador) e os 3 modelos usados na selfie para
// public/face-search/, com hash do conteúdo no nome: o .htaccess os serve com cache imutável.
// Uso: npm run faces:assets
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { faceDir, root, shortHash, writeManifest } from './face-manifest.mjs';

const pkg = path.join(root, 'node_modules/@vladmandic/face-api');
// Selfie: detector leve + landmarks + reconhecimento (~6,7 MB). O SSD (5,6 MB) só é usado na indexação.
const MODELS = ['tiny_face_detector_model', 'face_landmark_68_model', 'face_recognition_model'];

await rm(path.join(faceDir, 'lib'), { recursive: true, force: true });
await rm(path.join(faceDir, 'models'), { recursive: true, force: true });
await mkdir(path.join(faceDir, 'lib'), { recursive: true });
await mkdir(path.join(faceDir, 'models'), { recursive: true });

const lib = await readFile(path.join(pkg, 'dist/face-api.js'));
const libName = `face-api.${shortHash(lib)}.js`;
await copyFile(path.join(pkg, 'dist/face-api.js'), path.join(faceDir, 'lib', libName));

for (const name of MODELS) {
  const weights = await readFile(path.join(pkg, 'model', `${name}.bin`));
  const binName = `${name}.${shortHash(weights)}.bin`;
  const manifest = JSON.parse(await readFile(path.join(pkg, 'model', `${name}-weights_manifest.json`), 'utf8'));
  // Cada modelo tem um único shard; o loader resolve `paths` relativo à pasta do manifest.
  manifest[0].paths = [binName];
  await copyFile(path.join(pkg, 'model', `${name}.bin`), path.join(faceDir, 'models', binName));
  await writeFile(path.join(faceDir, 'models', `${name}-weights_manifest.json`), JSON.stringify(manifest));
}

await writeManifest({ lib: `lib/${libName}`, models: 'models' });
console.log(`Assets faciais prontos: lib/${libName} e ${MODELS.length} modelos em public/face-search/models/.`);
