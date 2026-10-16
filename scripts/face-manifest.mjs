// Leitura e escrita do manifest do índice facial (public/face-search/manifest.json).
// Dois scripts o atualizam (assets e índice): cada um preserva o que o outro gravou.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DIM, SCALE, THRESHOLDS } from '../src/faceSearch/format.js';

export const root = path.resolve(import.meta.dirname, '..');
export const faceDir = path.join(root, 'public/face-search');
const manifestPath = path.join(faceDir, 'manifest.json');

export const shortHash = (bytes) => createHash('sha256').update(bytes).digest('hex').slice(0, 10);

export async function readManifest() {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    return {};
  }
}

export async function writeManifest(patch) {
  const current = await readManifest();
  const next = {
    ...current,
    ...patch,
    // Constantes do formato/limiares vêm do código, nunca de um manifest antigo.
    version: 1,
    model: 'face-api-dlib-128',
    dim: DIM,
    scale: SCALE,
    thresholds: THRESHOLDS,
    albums: { ...current.albums, ...patch.albums },
  };
  await mkdir(faceDir, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
