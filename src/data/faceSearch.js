// Só no servidor (build): diz se um álbum tem índice facial em public/face-search.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let manifest;
export function hasFaceIndex(folder) {
  if (manifest === undefined) {
    try {
      manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/face-search/manifest.json'), 'utf8'));
    } catch {
      manifest = null;
    }
  }
  return Boolean(manifest?.albums?.[folder]?.faces);
}
