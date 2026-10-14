import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir, stat, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BYTES = 20 * 1024 * 1024;
const RASTER = /\.(?:png|jpe?g|webp|avif)$/i;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const exists = async (file) => stat(file).then(() => true, () => false);

export async function collectSources(root = ROOT) {
  const sources = new Set();
  for (const filename of ['landing_page.json', 'galeria.json']) {
    const rows = JSON.parse(await readFile(path.join(root, 'public/api', filename), 'utf8'));
    for (const row of rows) {
      const source = row.mediaUrl || row.imageUrl;
      if (source && RASTER.test(new URL(source).pathname)) sources.add(source);
    }
  }
  async function walk(directory) {
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
      const filename = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await walk(filename);
      else if (RASTER.test(filename)) sources.add(filename);
    }
  }
  await walk('src/assets');
  sources.add('/preloadBanner.webp');
  return [...sources].sort();
}

export async function download(source, { fetchImpl = fetch, maxBytes = MAX_BYTES } = {}) {
  const url = new URL(source);
  if (url.protocol !== 'https:' || url.hostname !== 'gtap.com.br' || url.port || url.username || url.password) {
    throw new Error(`Unapproved media origin: ${source}`);
  }
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('Image exceeds byte limit');
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new Error('Image exceeds byte limit');
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw new Error(`${source}: ${lastError.message}`);
}

export async function optimizeImage(input, { outputDirectory, urlPrefix = '/optimized', sizes = [320, 640, 960, 1440], formats = ['webp', 'avif'], name }) {
  if (input.length > MAX_BYTES) throw new Error('Image exceeds byte limit');
  const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  if (metadata.pages > 1) throw new Error('Animated media requires an explicit optimization policy');
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error('Image dimensions unavailable');
  const largest = Math.max(...sizes);
  const widths = [...new Set(sizes.filter((size) => size < width).concat(Math.min(width, largest)))];
  const digest = name ?? hash(Buffer.concat([Buffer.from('gtap-media-v2-webp85-avif60-'), input])).slice(0, 20);
  await mkdir(outputDirectory, { recursive: true });
  const variants = Object.fromEntries(formats.map((format) => [format, []]));
  for (const size of widths) {
    for (const format of formats) {
      const filename = `${digest}-${size}.${format}`;
      const destination = path.join(outputDirectory, filename);
      if (!(await exists(destination))) {
        const pipeline = sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width: size, withoutEnlargement: true });
        const temporary = `${destination}.${randomUUID()}.tmp`;
        try {
          await pipeline[format]({ quality: format === 'webp' ? 85 : 60, effort: 4 }).toFile(temporary);
          await rename(temporary, destination);
        } finally {
          await rm(temporary, { force: true });
        }
      }
      variants[format].push({ src: `${urlPrefix}/${filename}`, width: size });
    }
  }
  return {
    src: variants.webp.at(-1).src,
    srcSet: variants.webp.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    ...(variants.avif && { avifSrcSet: variants.avif.map((variant) => `${variant.src} ${variant.width}w`).join(', ') }),
    width,
    height,
  };
}

export function backgroundStyles(manifest) {
  const declarations = Object.entries(manifest)
    // Capas dos álbuns (src/assets/capas) são <img>, não fundo: ficam fora do CSS global.
    .filter(([source]) => source.startsWith('src/assets/') && !source.startsWith('src/assets/capas/'))
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([source, image]) => {
      const token = `--gtap-bg-${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const avif = image.avifSrcSet.split(', ').at(-1).split(' ')[0];
      return `  ${token}: image-set(url("${avif}") type("image/avif"), url("${image.src}") type("image/webp"));`;
    });
  return `/* Generated by scripts/optimize-images.mjs. */\n:root {\n${declarations.join('\n')}\n}\n`;
}

async function writeIfChanged(target, serialized) {
  await mkdir(path.dirname(target), { recursive: true });
  if (!(await exists(target)) || await readFile(target, 'utf8') !== serialized) await writeFile(target, serialized);
}

async function readSource(source, { root, cache, refresh, fetchImpl }) {
  if (!source.startsWith('https://')) return readFile(path.join(root, source.startsWith('/') ? `public${source}` : source));
  const cached = path.join(cache, hash(source));
  const input = !refresh && await exists(cached) ? await readFile(cached) : await download(source, { fetchImpl });
  if (refresh || !(await exists(cached))) await writeFile(cached, input);
  return input;
}

async function runPool(items, task, concurrency) {
  let cursor = 0;
  const failures = [];
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        await task(item);
      } catch (error) {
        failures.push(`${item}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return failures;
}

// Álbuns (public/api/galerias/*.json): as fotos ficam no servidor, em
// https://gtap.com.br/midias/<edição>/{full,mid,thumb}/<id>.webp, já otimizadas
// (scripts/import-pictime-gallery.mjs gera as três versões). Cada linha traz url (full),
// thumb, width e height; o manifesto só monta o srcset (thumb, mid de MID_WIDTH e full)
// e não baixa nem converte nada, exceto a miniatura de uma foto nova (para saber a largura).
export const GALLERY_MANIFEST = 'src/data/gallery-media.json';
export const MID_WIDTH = 800;
const ALBUM_PATH = /^https:\/\/gtap\.com\.br\/midias\/[IVX]+%20GTAP\/(?:full|thumb)\/[a-z0-9-]+\.webp$/;

export function assertAlbumPath(value) {
  if (typeof value !== 'string' || value.includes('..') || !ALBUM_PATH.test(value)) {
    throw new Error(`Caminho inválido no álbum: ${value}`);
  }
  return value;
}

export const midPath = (url) => url.replace('/full/', '/mid/');

export async function collectAlbumRows(root = ROOT) {
  const directory = path.join(root, 'public/api/galerias');
  const rows = [];
  for (const filename of (await readdir(directory)).filter((name) => name.endsWith('.json')).sort()) {
    for (const row of JSON.parse(await readFile(path.join(directory, filename), 'utf8'))) {
      assertAlbumPath(row.url);
      assertAlbumPath(row.thumb);
      if (!(row.width > 0 && row.height > 0)) throw new Error(`${row.url}: width/height ausentes`);
      rows.push(row);
    }
  }
  return rows;
}

/** Entrada do manifesto de uma foto: thumb, intermediária (se couber) e full. */
export function albumEntry(row, thumbWidth) {
  const variants = [[row.thumb, thumbWidth]];
  if (row.width > MID_WIDTH) variants.push([midPath(row.url), MID_WIDTH]);
  variants.push([row.url, row.width]);
  return {
    src: row.url,
    srcSet: variants.map(([src, width]) => `${src} ${width}w`).join(', '),
    width: row.width,
    height: row.height,
  };
}

export async function buildGallery({ root = ROOT, fetchImpl = fetch } = {}) {
  const start = Date.now();
  const manifestPath = path.join(root, GALLERY_MANIFEST);
  const previous = await exists(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};
  const rows = await collectAlbumRows(root);
  const entries = {};
  let downloaded = 0;
  const failures = await runPool(rows, async (row) => {
    // Largura real da thumb: reaproveitada do manifesto anterior; foto nova baixa só a miniatura.
    const known = previous[row.url]?.srcSet?.match(/^\S+ (\d+)w/);
    let thumbWidth;
    if (known && previous[row.url].srcSet.startsWith(`${row.thumb} `)) thumbWidth = Number(known[1]);
    else {
      thumbWidth = (await sharp(await download(row.thumb, { fetchImpl })).metadata()).width;
      downloaded += 1;
    }
    entries[row.url] = albumEntry(row, thumbWidth);
  }, 12);
  if (failures.length) throw new Error(`Gallery photos failed (${failures.length}):\n${failures.join('\n')}`);
  const ordered = Object.fromEntries(rows.map((row) => [row.url, entries[row.url]]));
  await writeIfChanged(manifestPath, `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`Gallery: ${rows.length} photos, ${downloaded} thumbs measured; ${((Date.now() - start) / 1000).toFixed(1)}s.`);
  return ordered;
}

const variantFiles = (image) => [image.srcSet, image.avifSrcSet].filter(Boolean)
  .flatMap((srcSet) => srcSet.split(', ').map((item) => path.basename(item.split(' ')[0])));

// Remove variantes que nenhum item do manifesto usa mais (só arquivos, não subpastas).
async function prune(directory, manifest) {
  const used = new Set(Object.values(manifest).flatMap(variantFiles));
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && !used.has(entry.name)) await rm(path.join(directory, entry.name));
  }
}

// Imagens do site: as variantes ficam versionadas em public/optimized/ com o
// manifesto e o CSS gerados. Locais são relidas (barato) e só reconvertidas se
// mudarem; remotas só são baixadas se ainda não tiverem variantes versionadas.
export async function buildMedia({ root = ROOT, refresh = false, fetchImpl = fetch } = {}) {
  const start = Date.now();
  const sources = await collectSources(root);
  const cache = path.join(root, '.cache/gtap-media');
  const outputDirectory = path.join(root, 'public/optimized');
  const target = path.join(root, 'src/data/generated-media.json');
  const previous = await exists(target) ? JSON.parse(await readFile(target, 'utf8')) : {};
  await mkdir(outputDirectory, { recursive: true });
  const manifest = {};
  let downloads = 0;
  const failures = await runPool(sources, async (source) => {
    const image = previous[source];
    if (source.startsWith('https://') && image && !refresh) {
      const files = variantFiles(image);
      if ((await Promise.all(files.map((file) => exists(path.join(outputDirectory, file))))).every(Boolean)) {
        manifest[source] = image;
        return;
      }
    }
    if (source.startsWith('https://')) {
      downloads += 1;
      await mkdir(cache, { recursive: true });
    }
    const input = await readSource(source, { root, cache, refresh, fetchImpl });
    manifest[source] = await optimizeImage(input, { outputDirectory });
  }, 6);
  if (failures.length) throw new Error(`Required images failed (${failures.length}):\n${failures.join('\n')}`);
  const ordered = Object.fromEntries(sources.map((source) => [source, manifest[source]]));
  await prune(outputDirectory, ordered);
  await writeIfChanged(target, `${JSON.stringify(ordered, null, 2)}\n`);
  await writeIfChanged(path.join(root, 'src/styles/generated-media.css'), backgroundStyles(ordered));
  console.log(`Images: ${sources.length} sources, ${downloads} downloaded; ${((Date.now() - start) / 1000).toFixed(1)}s.`);
  return ordered;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const refresh = process.argv.includes('--refresh');
  buildMedia({ refresh }).then(() => buildGallery()).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
