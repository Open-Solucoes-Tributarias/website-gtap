// Verificação de PRODUÇÃO (gtap.com.br): rotas, build no ar, redirect da Open e arquivos de midias/.
// Uso: npm run verify:prod   (ou GTAP_BASE=https://outro-host npm run verify:prod)
//
// Todas as requisições levam um cache-buster (?cb=...): o Cloudflare da Hostinger guarda cópias
// por semanas e mascara arquivos que já sumiram da origem (aconteceu com midias/ em 14/10/2026).
// Um 200 sem cache-buster NÃO prova que o arquivo existe no servidor.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.env.GTAP_BASE || 'https://gtap.com.br').replace(/\/$/, '');
const MIDIAS = /https:\/\/gtap\.com\.br\/midias\/[^"'\s<>\\]+/g;

const bust = (url) => `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}${Math.floor(Math.random() * 1e6)}`;

/** URLs de midias/ que o site usa: dados (public/api) e uma amostra por álbum (primeira e última foto, thumb/mid/full). */
export async function collectMidiasUrls(root = ROOT) {
  const urls = new Set();
  for (const file of ['landing_page.json', 'galeria.json']) {
    const text = await readFile(path.join(root, 'public/api', file), 'utf8');
    for (const match of text.matchAll(MIDIAS)) urls.add(new URL(match[0]).href);
  }
  const manifest = JSON.parse(await readFile(path.join(root, 'src/data/gallery-media.json'), 'utf8'));
  const albums = new Map();
  for (const [url, image] of Object.entries(manifest)) {
    const album = url.match(/\/midias\/([^/]+)\//)?.[1];
    if (!album) continue;
    if (!albums.has(album)) albums.set(album, []);
    albums.get(album).push(image);
  }
  for (const images of albums.values()) {
    for (const image of [images[0], images.at(-1)]) {
      for (const item of image.srcSet.split(', ')) urls.add(item.split(' ')[0]);
    }
  }
  return [...urls].sort();
}

async function status(url, { method = 'GET', redirect = 'follow', range = false } = {}) {
  const response = await fetch(bust(url), {
    method,
    redirect,
    headers: range ? { Range: 'bytes=0-0' } : {},
    signal: AbortSignal.timeout(30000),
  });
  await response.body?.cancel();
  return response;
}

export async function verifyProduction({ log = console.log } = {}) {
  const failures = [];
  const check = (ok, label) => { if (!ok) failures.push(label); log(`${ok ? 'ok  ' : 'FALHA'} ${label}`); };

  // Build no ar: home com o vídeo otimizado e sem restos de mídia antiga.
  const home = await (await fetch(bust(`${BASE}/`), { signal: AbortSignal.timeout(30000) })).text();
  check(/<video[^>]+class="video-background"[^>]+src="\/optimized-video\/banner-[a-f0-9]{16}\.mp4"/.test(home), 'home: banner usa o vídeo otimizado');
  check(!home.includes('galeria-otimizada'), 'home: sem referência a galeria-otimizada');

  // Rotas.
  const { editions } = await import(pathToFileURL(path.join(ROOT, 'src/data/editions.js')).href);
  const routes = ['/', '/galeria/', ...editions.map((edition) => `/${encodeURIComponent(edition.editionText)}/`), '/sorteio/'];
  for (const route of routes) {
    const response = await status(`${BASE}${route}`);
    check(response.status === 200, `rota ${route} → ${response.status}`);
  }
  const missing = await status(`${BASE}/naoexiste/`);
  check(missing.status === 404, `rota inexistente → ${missing.status} (esperado 404)`);
  const open = await status(`${BASE}/open-solucoes-tributarias/`, { redirect: 'manual' });
  check(open.status === 301 && /opensolucoestributarias\.com\.br/.test(open.headers.get('location') || ''), `redirect da Open → ${open.status}`);

  // midias/ na origem (Range 0-0 evita baixar vídeos inteiros).
  const urls = await collectMidiasUrls();
  const results = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await status(url, { range: true });
        results.push([url, response.status]);
      } catch (error) {
        results.push([url, error.message]);
      }
    }
  }));
  const bad = results.filter(([, code]) => code !== 200 && code !== 206);
  check(bad.length === 0, `midias/ na origem: ${results.length - bad.length}/${results.length} arquivos ok`);
  for (const [url, code] of bad) log(`      ${code} ${url}`);
  if (bad.length) failures.push(...bad.map(([url, code]) => `${code} ${url}`));

  return failures;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyProduction().then((failures) => {
    if (failures.length) {
      console.error(`\n${failures.length} verificação(ões) falharam em ${BASE}.`);
      process.exitCode = 1;
    } else {
      console.log(`\nProdução verificada em ${BASE}.`);
    }
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
