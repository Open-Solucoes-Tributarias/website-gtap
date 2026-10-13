import { mkdir, readFile, writeFile, stat, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://pictime7eus1public-pub-hdf3hecqdpaqeuev.a02.azurefd.net/pictures/54/44/54044754/332r2e3vmx6d5kh0tl';
const GALLERY_URL = `${BASE}/gallery.json.txt`;
const photoUrl = (photoId) => `${BASE}/lowres/${photoId}.jpg`;
const SCENE_ORDER = ['Primeiro Dia', 'Segundo Dia'];
const MAX_BYTES = 20 * 1024 * 1024;
const CONCURRENCY = 8;
const exists = async (file) => stat(file).then(() => true, () => false);

export function parseScenes(gallery) {
  const stride = gallery.version >= 3 ? 5 : 4;
  return gallery.scenes
    .map((scene) => {
      const photoIds = [];
      for (let i = 0; i < scene.photos.length; i += stride) photoIds.push(gallery.minId + scene.photos[i]);
      return { sceneName: scene.nm, photoIds };
    })
    .filter((scene) => scene.photoIds.length > 0);
}

export function orderScenes(scenes) {
  const rank = (scene) => {
    const index = SCENE_ORDER.indexOf(scene.sceneName);
    return index === -1 ? SCENE_ORDER.length : index;
  };
  return scenes.map((scene, position) => ({ scene, position }))
    .sort((a, b) => rank(a.scene) - rank(b.scene) || a.position - b.position)
    .map(({ scene }) => scene);
}

export function buildEntries(orderedScenes) {
  return orderedScenes.flatMap((scene, sceneIndex) => scene.photoIds.map((photoId, i) => {
    const id = `dia-${sceneIndex + 1}-${String(i + 1).padStart(3, '0')}`;
    return {
      id,
      photoId,
      url: `/galerias/x-gtap/full/${id}.webp`,
      thumb: `/galerias/x-gtap/thumb/${id}.webp`,
      scene: scene.sceneName,
    };
  }));
}

async function fetchBuffer(url, { expectJpeg = false, fetchImpl = fetch } = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (expectJpeg && !/^image\/jpeg/i.test(response.headers.get('content-type') || '')) {
        throw new Error(`Unexpected content-type ${response.headers.get('content-type')}`);
      }
      const body = Buffer.from(await response.arrayBuffer());
      if (body.length > MAX_BYTES) throw new Error('Image exceeds byte limit');
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw new Error(`${url}: ${lastError.message}`);
}

async function writeAtomic(destination, pipeline) {
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await pipeline.toFile(temporary);
    await rename(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function importGallery({ root = ROOT, force = false } = {}) {
  const cache = path.join(root, '.cache/pictime');
  const fullDir = path.join(root, 'public/galerias/x-gtap/full');
  const thumbDir = path.join(root, 'public/galerias/x-gtap/thumb');
  await Promise.all([cache, fullDir, thumbDir, path.join(root, 'public/api/galerias')].map((d) => mkdir(d, { recursive: true })));

  const gallery = JSON.parse((await fetchBuffer(GALLERY_URL)).toString('utf8'));
  const entries = buildEntries(orderScenes(parseScenes(gallery)));
  const results = new Array(entries.length);
  const failures = [];
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < entries.length) {
      const index = cursor++;
      const entry = entries[index];
      try {
        const fullPath = path.join(fullDir, `${entry.id}.webp`);
        const thumbPath = path.join(thumbDir, `${entry.id}.webp`);
        let input;
        const need = async () => {
          if (input) return input;
          const cached = path.join(cache, `${entry.photoId}.jpg`);
          if (await exists(cached)) input = await readFile(cached);
          else {
            input = await fetchBuffer(photoUrl(entry.photoId), { expectJpeg: true });
            await writeFile(cached, input);
          }
          return input;
        };
        if (force || !(await exists(fullPath))) {
          await writeAtomic(fullPath, sharp(await need()).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }));
        }
        if (force || !(await exists(thumbPath))) {
          await writeAtomic(thumbPath, sharp(await need()).rotate().resize({ width: 360, height: 360, fit: 'inside', withoutEnlargement: true }).webp({ quality: 60 }));
        }
        const { width, height } = await sharp(fullPath).metadata();
        results[index] = { id: entry.id, url: entry.url, thumb: entry.thumb, width, height, scene: entry.scene };
      } catch (error) {
        failures.push(`${entry.id} (${entry.photoId}): ${error.message}`);
      }
      if (++done % 50 === 0) console.log(`${done}/${entries.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failures.length) throw new Error(`Failed ${failures.length} photos:\n${failures.join('\n')}`);

  await writeFile(path.join(root, 'public/api/galerias/x-gtap.json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Imported ${results.length} photos.`);
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  importGallery({ force: process.argv.includes('--force') }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
