import test from 'node:test';
import assert from 'node:assert/strict';
import { PHOTOS, coverRect, tintPixels } from './compose-home-assets.mjs';

test('coverRect keeps target ratio, follows focus and stays inside the source', () => {
  assert.deepEqual(coverRect(1600, 1000, 400, 400), { left: 300, top: 0, width: 1000, height: 1000 });
  assert.deepEqual(coverRect(1600, 1000, 400, 400, [0, 0.5]), { left: 0, top: 0, width: 1000, height: 1000 });
  assert.deepEqual(coverRect(1600, 1000, 400, 400, [1, 0.5]), { left: 600, top: 0, width: 1000, height: 1000 });
  const rect = coverRect(1000, 1600, 640, 1080);
  assert.ok(rect.width <= 1000 && rect.height <= 1600 && rect.left >= 0 && rect.top >= 0);
  assert.ok(Math.abs(rect.width / rect.height - 640 / 1080) < 0.01);
});

test('tintPixels reproduces the target mean and spread per channel', () => {
  const luma = Buffer.from([0, 64, 128, 192, 255, 30, 220, 100]);
  const target = { mean: [27, 37, 98], sd: [17, 22, 25] };
  const out = tintPixels(luma, target);
  for (let c = 0; c < 3; c++) {
    const values = [...luma.keys()].map((i) => out[i * 3 + c]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    assert.ok(Math.abs(mean - target.mean[c]) < 1.5, `mean ${c}`);
    assert.ok(Math.abs(sd - target.sd[c]) < 1.5, `sd ${c}`);
  }
});

// As fotos vêm de https://gtap.com.br/midias/X GTAP/full/<id>.webp (álbum curado + as usadas só nos recortes).
test('every chosen photo id follows the X GTAP naming', () => {
  for (const { id } of Object.values(PHOTOS)) assert.match(id, /^dia-[12]-\d{3}$/);
});
