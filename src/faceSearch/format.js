// Formato do índice facial (um arquivo .bin por álbum) e busca por distância.
// Código puro, sem DOM nem Node: usado pelo indexador (scripts/) e pelo navegador.
//
//   bytes 0-3   "GFC1"            (assinatura + versão)
//   bytes 4-7   N                 (uint32 LE, número de rostos)
//   2N bytes    foto de cada rosto (uint16 LE, posição na lista `photos` do manifest)
//   128N bytes  descritores quantizados (int8)

export const DIM = 128;
// Descritores do dlib ficam em ~[-0.4, 0.4]; 127/0.5 mantém o erro de distância < 0.02.
export const SCALE = 127 / 0.5;
export const MAGIC = 'GFC1';
// Distância euclidiana: ≤ strong = alta confiança; ≤ possible = possível correspondência.
export const THRESHOLDS = { strong: 0.5, possible: 0.55 };

export function quantize(descriptor) {
  const out = new Int8Array(DIM);
  for (let i = 0; i < DIM; i += 1) out[i] = Math.max(-127, Math.min(127, Math.round(descriptor[i] * SCALE)));
  return out;
}

// faces: [{ photo: número, descriptor: number[128] | Float32Array }]
export function packIndex(faces) {
  const count = faces.length;
  const bytes = new Uint8Array(8 + 2 * count + DIM * count);
  const view = new DataView(bytes.buffer);
  bytes.set([...MAGIC].map((char) => char.charCodeAt(0)), 0);
  view.setUint32(4, count, true);
  faces.forEach(({ photo, descriptor }, n) => {
    view.setUint16(8 + 2 * n, photo, true);
    bytes.set(new Uint8Array(quantize(descriptor).buffer), 8 + 2 * count + DIM * n);
  });
  return bytes;
}

export function unpackIndex(buffer) {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (magic !== MAGIC) throw new Error('Índice facial inválido');
  const count = view.getUint32(4, true);
  if (buffer.byteLength !== 8 + 2 * count + DIM * count) throw new Error('Índice facial truncado');
  const photos = new Uint16Array(count);
  for (let n = 0; n < count; n += 1) photos[n] = view.getUint16(8 + 2 * n, true);
  return { count, photos, descriptors: new Int8Array(buffer, 8 + 2 * count, DIM * count) };
}

export function distance(query, descriptors, face) {
  let sum = 0;
  const base = face * DIM;
  for (let i = 0; i < DIM; i += 1) {
    const diff = query[i] - descriptors[base + i] / SCALE;
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Melhor distância por foto (uma foto com vários rostos conta pelo mais parecido),
// ordenado da mais parecida para a menos. Retorna [{ photo, distance }].
export function search(index, query, limit = THRESHOLDS.possible) {
  const best = new Map();
  for (let face = 0; face < index.count; face += 1) {
    const d = distance(query, index.descriptors, face);
    if (d > limit) continue;
    const photo = index.photos[face];
    if (d < (best.get(photo) ?? Infinity)) best.set(photo, d);
  }
  return [...best].map(([photo, d]) => ({ photo, distance: d })).sort((a, b) => a.distance - b.distance);
}

// Descritor médio de vários quadros (câmera): mais estável do que um quadro só.
export function averageDescriptors(list) {
  const out = new Float32Array(DIM);
  for (const descriptor of list) for (let i = 0; i < DIM; i += 1) out[i] += descriptor[i] / list.length;
  return out;
}
