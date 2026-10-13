// Regenera as fotos de evento da home/galeria em src/assets/ a partir das fotos locais de 2026
// (public/galerias/x-gtap/full/<id>.webp), mantendo nome, dimensões e tratamento visual dos originais.
// Uso: node scripts/compose-home-assets.mjs  (saídas versionadas; não faz parte do build —
// depois rode `npm run media:images` para regerar os srcsets em public/optimized/).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Fotos escolhidas (id da galeria X GTAP) e ponto de foco [x, y] (0–1) usado no recorte.
export const PHOTOS = {
  temasFoto1: { id: 'dia-1-304', focus: [0.5, 0.5] }, // participante filmando o palco com o celular
  temasFoto2: { id: 'dia-1-406', focus: [0.5, 0.4] }, // palestrante com microfone
  imageMobile: { id: 'dia-1-304', focus: [0.5, 0.5] },
  imagebg1: { id: 'dia-1-187', focus: [0.5, 0.45] }, // palestrante no púlpito + plateia
  forms: { id: 'dia-2-147', focus: [0.5, 0.4] }, // participantes sorrindo
  bannerLeft: { id: 'dia-2-091', focus: [0.33, 0.5] }, // plateia atenta
  bannerCenter: { id: 'dia-2-046', focus: [0.5, 0.5] }, // palestrante no palco
  bannerRight: { id: 'dia-1-307', focus: [0.5, 0.5] }, // dupla em frente ao painel
  bannerMobile: { id: 'dia-1-305', focus: [0.5, 0.45] }, // trio em frente ao painel
};

// Faixa inferior descartada antes do recorte: contém a marca d'água do fotógrafo.
const WATERMARK_TRIM = 0.05;

// Tinta azul dos fundos: média e desvio por canal (RGB) medidos nos originais.
const TINT_IMAGEBG1 = { mean: [27, 37, 98], sd: [17, 22, 25] };

/** Maior retângulo com a proporção pedida dentro de (width x height), centrado no foco. */
export function coverRect(width, height, targetWidth, targetHeight, [fx, fy] = [0.5, 0.5]) {
  const scale = Math.min(width / targetWidth, height / targetHeight);
  const w = Math.round(targetWidth * scale);
  const h = Math.round(targetHeight * scale);
  const clamp = (value, max) => Math.min(Math.max(value, 0), max);
  return {
    left: clamp(Math.round(fx * width - w / 2), width - w),
    top: clamp(Math.round(fy * height - h / 2), height - h),
    width: w,
    height: h,
  };
}

/** Mapeia a luminância (0–255) para a tinta: cada canal ganha a média e o desvio alvo. */
export function tintPixels(luma, { mean, sd }) {
  let sum = 0;
  for (const value of luma) sum += value;
  const lumaMean = sum / luma.length;
  let variance = 0;
  for (const value of luma) variance += (value - lumaMean) ** 2;
  const lumaSd = Math.sqrt(variance / luma.length) || 1;
  const out = Buffer.alloc(luma.length * 3);
  for (let i = 0; i < luma.length; i++) {
    const z = (luma[i] - lumaMean) / lumaSd;
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.min(255, Math.max(0, Math.round(mean[c] + z * sd[c])));
  }
  return out;
}

async function photo({ id, focus }, width, height) {
  const source = path.join(root, 'public/galerias/x-gtap/full', `${id}.webp`);
  const meta = await sharp(source).metadata();
  const usableHeight = Math.round(meta.height * (1 - WATERMARK_TRIM));
  const rect = coverRect(meta.width, usableHeight, width, height, focus);
  return sharp(source).extract(rect).resize(width, height).toBuffer();
}

function roundedMask(width, height, radius) {
  return Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></svg>`);
}

async function card(spec, width, height, radius) {
  return sharp(await photo(spec, width, height))
    .ensureAlpha()
    .composite([{ input: roundedMask(width, height, radius), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function tinted(spec, width, height, tint) {
  const luma = await sharp(await photo(spec, width, height)).greyscale().raw().toBuffer();
  return sharp(tintPixels(luma, tint), { raw: { width, height, channels: 3 } }).png().toBuffer();
}

const transparent = (width, height) => sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
const save = (image, name) => image.webp({ quality: 86, alphaQuality: 100, effort: 6 }).toFile(path.join(root, 'src/assets', name));

// Fotos da colagem da seção de atuação (recortes simples, sem tratamento).
async function temasFotos() {
  await save(sharp(await photo(PHOTOS.temasFoto1, 920, 920)), 'temas-foto-1.webp');
  await save(sharp(await photo(PHOTOS.temasFoto2, 920, 1227)), 'temas-foto-2.webp');
}

// Cartão 105x105 levemente inclinado (versão mobile da colagem).
async function imageMobile() {
  const tilted = await sharp(await card(PHOTOS.imageMobile, 80, 78, 8))
    .rotate(-4.5, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const { width, height } = await sharp(tilted).metadata();
  await save(transparent(105, 105).composite([
    { input: tilted, left: Math.round(52 - width / 2), top: Math.round(47 - height / 2) },
  ]), 'image-mobile.webp');
}

async function imagebg1() {
  const background = await tinted(PHOTOS.imagebg1, 1284, 456, TINT_IMAGEBG1);
  await save(sharp(background).ensureAlpha().composite([{ input: roundedMask(1284, 456, 14), blend: 'dest-in' }]), 'imagebg1.webp');
}

async function forms() {
  await save(sharp(await photo(PHOTOS.forms, 772, 772)), 'eventogtapforms.webp');
}

// Banner da galeria: três fotos verticais lado a lado (1920x1080).
async function bannerGaleria() {
  const panels = [PHOTOS.bannerLeft, PHOTOS.bannerCenter, PHOTOS.bannerRight];
  const inputs = await Promise.all(panels.map(async (spec, index) => ({ input: await photo(spec, 640, 1080), left: index * 640, top: 0 })));
  await save(transparent(1920, 1080).composite(inputs), 'bannergaleria.webp');
}

async function bannerMobile() {
  await save(sharp(await photo(PHOTOS.bannerMobile, 393, 409)), 'banner-mobile-galeria.webp');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  Promise.all([temasFotos(), imageMobile(), imagebg1(), forms(), bannerGaleria(), bannerMobile()])
    .then(() => console.log('Assets da home regenerados em src/assets/.'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
