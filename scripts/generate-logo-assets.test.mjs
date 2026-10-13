import test from 'node:test';
import assert from 'node:assert/strict';
import { unpremultiplyFromBlack, runsOf, planEditionX } from './generate-logo-assets.mjs';

test('unpremultiplyFromBlack: preto vira transparente', () => {
  assert.equal(unpremultiplyFromBlack(0, 0, 0).a, 0);
});

test('unpremultiplyFromBlack: branco permanece branco opaco', () => {
  assert.deepEqual(unpremultiplyFromBlack(255, 255, 255), { r: 255, g: 255, b: 255, a: 255 });
});

test('unpremultiplyFromBlack: azul vira cor saturada com alpha parcial', () => {
  const p = unpremultiplyFromBlack(100, 150, 200);
  assert.equal(p.a, 200);
  assert.ok(Math.abs(p.r - 127.5) < 0.01 && Math.abs(p.g - 191.25) < 0.01 && Math.abs(p.b - 255) < 0.01);
});

test('unpremultiplyFromBlack: ruido JPEG abaixo do limiar vira transparente', () => {
  assert.equal(unpremultiplyFromBlack(8, 6, 5).a, 0);
});

test('runsOf: faixas contíguas de valores positivos', () => {
  assert.deepEqual(runsOf([0, 3, 4, 0, 0, 1, 0, 2]), [[1, 2], [5, 5], [7, 7]]);
  assert.deepEqual(runsOf([0, 0]), []);
});

test('planEditionX: descarta a faixa do "I" e mantém o espaçamento I→globo entre X e globo', () => {
  // X 0-312, I 333-420, globo 458-869, GTAP 903-1999 (perfil medido na arte-fonte)
  const plan = planEditionX([[0, 312], [333, 420], [458, 869], [903, 1999]]);
  assert.deepEqual(plan, { left: [0, 312], right: [458, 1999], gap: 37 });
});

test('planEditionX: recusa perfil que não tem X, I, globo e GTAP', () => {
  assert.throws(() => planEditionX([[0, 312], [458, 869], [903, 1999]]), /4 faixas/);
  assert.throws(() => planEditionX([[0, 312], [333, 600], [658, 869], [903, 1999]]), /"I"/);
});
