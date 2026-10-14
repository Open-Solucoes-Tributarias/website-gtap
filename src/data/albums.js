// Só no servidor (build): lê o álbum de cada edição e junta as variantes otimizadas.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { editions } from './editions';
import gallery from './gallery-media.json';
import { getMedia } from './media';

// Capa: cópia da foto escolhida em src/assets/capas, com AVIF (é o LCP do álbum).
export const coverOf = (edition) => getMedia(`src/assets/capas/${edition.folder}.webp`);

export function loadAlbum(edition) {
  const rows = JSON.parse(readFileSync(join(process.cwd(), 'public/api/galerias', `${edition.folder}.json`), 'utf8'));
  return rows.map((row) => ({ url: row.url, image: gallery[row.url], ...(row.scene && { scene: row.scene }) }));
}

const href = (editionText) => `/${encodeURIComponent(editionText)}/`;

// Resumo de cada edição (capa e total de fotos), da mais recente para a mais antiga.
export function editionSummaries() {
  return editions.map((edition) => {
    const album = loadAlbum(edition);
    return { editionText: edition.editionText, href: href(edition.editionText), count: album.length, cover: coverOf(edition) };
  }).reverse();
}
