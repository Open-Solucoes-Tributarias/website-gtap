import assert from 'node:assert/strict';
import test from 'node:test';
import { DIM, THRESHOLDS, averageDescriptors, distance, packIndex, quantize, search, unpackIndex } from '../src/faceSearch/format.js';

// Gerador pseudoaleatório determinístico (descritores parecidos com os do dlib: ±0.35).
function rng(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
const randomDescriptor = (next) => Float32Array.from({ length: DIM }, () => (next() - 0.5) * 0.7);
const euclidean = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

test('pack/unpack preserva rostos e fotos', () => {
  const next = rng(1);
  const faces = Array.from({ length: 40 }, (_, n) => ({ photo: n % 7, descriptor: randomDescriptor(next) }));
  const bytes = packIndex(faces);
  assert.equal(bytes.byteLength, 8 + 2 * 40 + DIM * 40);
  const index = unpackIndex(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  assert.equal(index.count, 40);
  assert.deepEqual([...index.photos], faces.map((face) => face.photo));
  assert.deepEqual([...index.descriptors.slice(0, DIM)], [...quantize(faces[0].descriptor)]);
});

test('unpack recusa arquivo inválido ou truncado', () => {
  assert.throws(() => unpackIndex(new ArrayBuffer(16)), /inválido/);
  const bytes = packIndex([{ photo: 0, descriptor: new Float32Array(DIM) }]);
  assert.throws(() => unpackIndex(bytes.buffer.slice(0, bytes.byteLength - 1)), /truncado/);
});

test('erro de distância por quantização fica abaixo de 0.02', () => {
  const next = rng(7);
  let worst = 0;
  for (let n = 0; n < 200; n += 1) {
    const a = randomDescriptor(next);
    const b = randomDescriptor(next);
    const bytes = packIndex([{ photo: 0, descriptor: b }]);
    const index = unpackIndex(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    worst = Math.max(worst, Math.abs(distance(a, index.descriptors, 0) - euclidean(a, b)));
  }
  assert.ok(worst < 0.02, `erro máximo ${worst}`);
});

test('search devolve a melhor distância por foto, em ordem, respeitando o limite', () => {
  const next = rng(3);
  const me = randomDescriptor(next);
  const nearby = (delta) => me.map((v) => v + delta);
  const faces = [
    { photo: 0, descriptor: randomDescriptor(next) },
    { photo: 1, descriptor: nearby(0.02) },
    { photo: 1, descriptor: randomDescriptor(next) },
    { photo: 2, descriptor: nearby(0.03) },
    { photo: 3, descriptor: randomDescriptor(next) },
  ];
  const bytes = packIndex(faces);
  const index = unpackIndex(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const found = search(index, me);
  assert.deepEqual(found.map((hit) => hit.photo), [1, 2]);
  assert.ok(found[0].distance < found[1].distance);
  assert.ok(found.every((hit) => hit.distance <= THRESHOLDS.possible));
});

test('averageDescriptors faz a média por dimensão', () => {
  const a = new Float32Array(DIM).fill(0.2);
  const b = new Float32Array(DIM).fill(0.4);
  assert.ok(Math.abs(averageDescriptors([a, b])[5] - 0.3) < 1e-6);
});
