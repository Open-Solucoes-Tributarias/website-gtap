import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, readFile, stat, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { albumEntry, assertAlbumPath, backgroundStyles, buildGallery, buildMedia, download, GALLERY_MANIFEST, MID_WIDTH, optimizeImage } from './optimize-images.mjs';

test('background tokens select largest formats deterministically and omit remote media', () => {
  const image = { src: '/optimized/hash-640.webp', avifSrcSet: '/optimized/hash-320.avif 320w, /optimized/hash-640.avif 640w' };
  const manifest = { 'src/assets/Background Footer.webp': image, 'https://gtap.com.br/image.jpg': image };
  const css = backgroundStyles(manifest);
  assert.match(css, /--gtap-bg-src-assets-background-footer-webp:/);
  assert.match(css, /url\("\/optimized\/hash-640.avif"\) type\("image\/avif"\)/);
  assert.match(css, /url\("\/optimized\/hash-640.webp"\) type\("image\/webp"\)/);
  assert.doesNotMatch(css, /320|gtap\.com/);
  const reversed = Object.fromEntries(Object.entries(manifest).reverse());
  assert.equal(backgroundStyles(reversed), css);
});

test('responsive variants preserve orientation, avoid upscale and reuse files', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gtap-media-test-'));
  try {
    const input = await sharp({ create: { width: 200, height: 400, channels: 3, background: '#336699' } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const image = await optimizeImage(input, { outputDirectory: directory });
    assert.equal(image.width, 400);
    assert.equal(image.height, 200);
    assert.match(image.srcSet, /320w.*400w/);
    assert.doesNotMatch(image.srcSet, /640w/);
    const files = await readdir(directory);
    assert.equal(files.length, 4);
    const modificationTimes = await Promise.all(files.map(async (file) => (await stat(path.join(directory, file))).mtimeMs));
    for (const file of files) {
      const metadata = await sharp(path.join(directory, file)).metadata();
      const expectedWidth = Number(file.match(/-(\d+)\./)[1]);
      assert.equal(metadata.width, expectedWidth);
      assert.equal(metadata.height, expectedWidth / 2);
      assert.equal(metadata.format, file.endsWith('.webp') ? 'webp' : 'heif');
    }
    assert.deepEqual(await optimizeImage(input, { outputDirectory: directory }), image);
    assert.deepEqual(await Promise.all(files.map(async (file) => (await stat(path.join(directory, file))).mtimeMs)), modificationTimes);
    await assert.rejects(optimizeImage(Buffer.from('invalid image'), { outputDirectory: directory }));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('download limits origin, size and retries before surfacing failure', async () => {
  let attempts = 0;
  const failingFetch = async () => { attempts++; return new Response('', { status: 404 }); };
  await assert.rejects(download('https://example.com/image.jpg', { fetchImpl: failingFetch }), /Unapproved media origin/);
  assert.equal(attempts, 0);
  await assert.rejects(download('https://gtap.com.br/image.jpg', { fetchImpl: failingFetch }), /HTTP 404/);
  assert.equal(attempts, 3);
  await assert.rejects(download('https://gtap.com.br/image.jpg', {
    maxBytes: 2,
    fetchImpl: async () => new Response('oversized'),
  }), /byte limit/);
  const output = await download('https://gtap.com.br/image.jpg', {
    fetchImpl: async (_url, options) => {
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal);
      return new Response('ok');
    },
  });
  assert.equal(output.toString(), 'ok');
});

test('site images reuse versioned variants offline and prune unused files', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'gtap-media-'));
  try {
    const photo = await sharp({ create: { width: 700, height: 400, channels: 3, background: '#abcdef' } }).webp().toBuffer();
    const remote = 'https://gtap.com.br/midias/palestrante.webp';
    await mkdir(path.join(root, 'public/api'), { recursive: true });
    await mkdir(path.join(root, 'src/assets'), { recursive: true });
    await writeFile(path.join(root, 'public/api/landing_page.json'), JSON.stringify([{ mediaUrl: remote }]));
    await writeFile(path.join(root, 'public/api/galeria.json'), '[]');
    await writeFile(path.join(root, 'src/assets/fundo.webp'), photo);
    await writeFile(path.join(root, 'public/preloadBanner.webp'), photo);
    let fetches = 0;
    const initial = await buildMedia({ root, fetchImpl: async () => { fetches++; return new Response(photo); } });
    assert.equal(fetches, 1);
    await writeFile(path.join(root, 'public/optimized/sobra-320.webp'), 'stale');

    await rm(path.join(root, '.cache'), { recursive: true, force: true });
    const offline = async () => { throw new Error('network not allowed'); };
    assert.deepEqual(await buildMedia({ root, fetchImpl: offline }), initial);
    assert.ok(!(await readdir(path.join(root, 'public/optimized'))).includes('sobra-320.webp'));
    assert.match(await readFile(path.join(root, 'src/styles/generated-media.css'), 'utf8'), /--gtap-bg-src-assets-fundo-webp/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

const MIDIAS = 'https://gtap.com.br/midias/X%20GTAP';
const photo = (id, extra = {}) => ({ id, url: `${MIDIAS}/full/${id}.webp`, thumb: `${MIDIAS}/thumb/${id}.webp`, width: 1600, height: 1065, ...extra });

test('album paths accept only the approved midias origin and reject traversal', () => {
  assert.equal(assertAlbumPath(`${MIDIAS}/full/dia-1-001.webp`), `${MIDIAS}/full/dia-1-001.webp`);
  for (const bad of [
    'https://evil.com/midias/X%20GTAP/full/a.webp',
    'https://gtap.com.br/midias/X%20GTAP/full/../../a.webp',
    'https://gtap.com.br/midias/%2e%2e/full/a.webp',
    'https://gtap.com.br/midias/X%20GTAP/full/a.jpg',
    '/galerias/x-gtap/full/a.webp',
    undefined,
  ]) {
    assert.throws(() => assertAlbumPath(bad), /inválido/);
  }
});

test('album entry points thumb, mid and full to midias/ and skips mid for small photos', () => {
  const row = photo('dia-1-001');
  assert.deepEqual(albumEntry(row, 360), {
    src: row.url,
    srcSet: `${row.thumb} 360w, ${MIDIAS}/mid/dia-1-001.webp ${MID_WIDTH}w, ${row.url} 1600w`,
    width: 1600,
    height: 1065,
  });
  assert.equal(albumEntry({ ...row, width: 700, height: 466 }, 360).srcSet, `${row.thumb} 360w, ${row.url} 700w`);
});

async function withAlbum(rows, previous, run) {
  const root = await mkdtemp(path.join(tmpdir(), 'gtap-album-'));
  try {
    await mkdir(path.join(root, 'public/api/galerias'), { recursive: true });
    await mkdir(path.join(root, 'src/data'), { recursive: true });
    await writeFile(path.join(root, 'public/api/galerias/x-gtap.json'), JSON.stringify(rows));
    if (previous) await writeFile(path.join(root, GALLERY_MANIFEST), JSON.stringify(previous));
    return await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('gallery build needs no network when the thumb width is already in the manifest', async () => {
  const row = photo('a-1', { width: 1200, height: 800 });
  const srcSet = `${row.thumb} 300w, ${MIDIAS}/mid/a-1.webp ${MID_WIDTH}w, ${row.url} 1200w`;
  await withAlbum([row], { [row.url]: { srcSet } }, async (root) => {
    const manifest = await buildGallery({ root, fetchImpl: () => assert.fail('no network') });
    assert.equal(manifest[row.url].srcSet, srcSet);
    assert.deepEqual(JSON.parse(await readFile(path.join(root, GALLERY_MANIFEST), 'utf8')), manifest);
  });
});

test('gallery build downloads only the thumb of a new photo to learn its width', async () => {
  const row = photo('b-1');
  const thumb = await sharp({ create: { width: 360, height: 240, channels: 3, background: '#335' } }).webp().toBuffer();
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(String(url));
    return new Response(thumb, { headers: { 'content-length': String(thumb.length) } });
  };
  await withAlbum([row], null, async (root) => {
    const manifest = await buildGallery({ root, fetchImpl });
    assert.deepEqual(requested, [row.thumb]);
    assert.equal(manifest[row.url].srcSet, `${row.thumb} 360w, ${MIDIAS}/mid/b-1.webp ${MID_WIDTH}w, ${row.url} 1600w`);
  });
});

test('gallery build rejects rows outside the approved origin', async () => {
  await withAlbum([photo('c-1', { url: 'https://evil.com/full/c-1.webp' })], null, async (root) => {
    await assert.rejects(buildGallery({ root, fetchImpl: () => assert.fail('no network') }), /inválido/);
  });
});
