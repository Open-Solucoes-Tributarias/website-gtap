// Gera as variações da logo XI GTAP (header, favicon, OG) a partir da arte-fonte (JPG com fundo preto)
// e a logo do álbum da X GTAP (2026), derivada da mesma arte sem o "I".
// Uso: npm run media:logo  (saídas versionadas; não faz parte do build)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

export const BRAND_DARK = '#0b1230';
const ALPHA_FLOOR = 12; // abaixo disso é ruído JPEG sobre o preto

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const SOURCE = path.join(here, 'assets', 'logo-xi-gtap-source.jpg');

/** Converte pixel sobre fundo preto em cor + alpha (alpha = canal máximo). */
export function unpremultiplyFromBlack(r, g, b) {
  const a = Math.max(r, g, b);
  if (a < ALPHA_FLOOR) return { r: 0, g: 0, b: 0, a: 0 };
  const k = 255 / a;
  return { r: r * k, g: g * k, b: b * k, a };
}

async function transparentSource() {
  const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
    const px = unpremultiplyFromBlack(data[i], data[i + 1], data[i + 2]);
    out[o] = Math.round(px.r);
    out[o + 1] = Math.round(px.g);
    out[o + 2] = Math.round(px.b);
    out[o + 3] = px.a;
  }
  return { buffer: out, width: info.width, height: info.height };
}

/** Faixas contíguas [início, fim] dos índices com valor > 0 num perfil de cobertura. */
export function runsOf(profile) {
  const runs = [];
  let start = -1;
  profile.forEach((value, index) => {
    if (value > 0 && start < 0) start = index;
    if (value <= 0 && start >= 0) {
      runs.push([start, index - 1]);
      start = -1;
    }
  });
  if (start >= 0) runs.push([start, profile.length - 1]);
  return runs;
}

/**
 * Plano da logo da X GTAP a partir das faixas de colunas da linha superior da arte (X, I, globo, GTAP):
 * descarta o "I" e aproxima o "X" do globo com o mesmo espaçamento que havia entre o "I" e o globo.
 */
export function planEditionX(columnRuns) {
  if (columnRuns.length !== 4) throw new Error(`esperadas 4 faixas (X, I, globo, GTAP), encontradas ${columnRuns.length}`);
  const [x, i, globe, gtap] = columnRuns;
  const width = ([a, b]) => b - a + 1;
  if (width(i) * 2 > width(x) || width(i) * 2 > width(globe)) throw new Error('faixa do "I" inesperada: largura incompatível com uma haste');
  return { left: x, right: [globe[0], gtap[1]], gap: globe[0] - i[1] - 1 };
}

const rawInput = ({ buffer, width, height }) => sharp(buffer, { raw: { width, height, channels: 4 } });

async function trimmed(src) {
  const png = await rawInput(src).png().toBuffer();
  return sharp(png).trim({ threshold: 1 }).png().toBuffer();
}

const webp = (buf, width, file) =>
  sharp(buf).resize({ width }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(file);

async function squareIcon(src, size, background) {
  // Recorte do globo (coordenadas da arte-fonte 2000x627)
  const globe = await rawInput(src)
    .extract({ left: 455, top: 0, width: 420, height: 330 })
    .png()
    .toBuffer();
  const trimmedGlobe = await sharp(globe).trim({ threshold: 1 }).png().toBuffer();
  const inner = Math.round(size * 0.86);
  const fitted = await sharp(trimmedGlobe).resize({ width: inner, height: inner, fit: 'inside' }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: fitted, gravity: 'center' }])
    .png()
    .toBuffer();
}

/** Linha superior da arte (X + globo + GTAP, sem o subtítulo "XI CONGRESSO…") sem o "I". */
async function editionXLogo(src) {
  const alpha = (x, y) => src.buffer[(y * src.width + x) * 4 + 3];
  const rowProfile = Array.from({ length: src.height }, (_, y) => {
    let count = 0;
    for (let x = 0; x < src.width; x++) if (alpha(x, y) > 0) count++;
    return count;
  });
  const [top, bottom] = runsOf(rowProfile)[0];
  const columnProfile = Array.from({ length: src.width }, (_, x) => {
    let count = 0;
    for (let y = top; y <= bottom; y++) if (alpha(x, y) > 0) count++;
    return count;
  });
  const { left, right, gap } = planEditionX(runsOf(columnProfile));
  const height = bottom - top + 1;
  const crop = ([from, to]) =>
    rawInput(src).extract({ left: from, top, width: to - from + 1, height }).png().toBuffer();
  const leftWidth = left[1] - left[0] + 1;
  const rightWidth = right[1] - right[0] + 1;
  const composed = await sharp({
    create: { width: leftWidth + gap + rightWidth, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: await crop(left), left: 0, top: 0 },
      { input: await crop(right), left: leftWidth + gap, top: 0 },
    ])
    .png()
    .toBuffer();
  return sharp(composed).trim({ threshold: 1 }).png().toBuffer();
}

export async function generate() {
  const dark = await transparentSource();
  const darkTrim = await trimmed(dark);

  await mkdir(path.join(root, 'public/assets/logos'), { recursive: true });
  await webp(darkTrim, 480, path.join(root, 'public/logo-xi-gtap.webp'));
  await webp(await editionXLogo(dark), 600, path.join(root, 'public/assets/logos/xgtap.webp'));

  // PNG com paleta: o navegador baixa o ícone com prioridade alta (era 154 KB em RGBA).
  const iconPng = (buffer, file) => sharp(buffer).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(file);
  await iconPng(await squareIcon(dark, 512), path.join(root, 'app/icon.png'));
  await iconPng(await squareIcon(dark, 180, BRAND_DARK), path.join(root, 'app/apple-icon.png'));

  const ogLogo = await sharp(darkTrim).resize({ width: 840 }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: BRAND_DARK } })
    .composite([{ input: ogLogo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, 'public/og-gtap.png'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generate();
  console.log('Logos XI GTAP (header) e X GTAP (álbum) geradas.');
}
