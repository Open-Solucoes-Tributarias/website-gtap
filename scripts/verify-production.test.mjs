import test from 'node:test';
import assert from 'node:assert/strict';
import { collectMidiasUrls } from './verify-production.mjs';

test('collectMidiasUrls lists only midias/ files the site uses, including videos and a sample per album', async () => {
  const urls = await collectMidiasUrls();
  assert.ok(urls.length > 50);
  for (const url of urls) assert.match(url, /^https:\/\/gtap\.com\.br\/midias\/[^\s"']+$/);
  assert.ok(urls.some((url) => /\/midias\/depoimentos\/.+\.mp4$/.test(url)), 'vídeos de depoimentos');
  for (const edition of ['I', 'V', 'VIII', 'X']) {
    assert.ok(urls.some((url) => url.includes(`/midias/${edition}%20GTAP/thumb/`)), `amostra do álbum ${edition}`);
    assert.ok(urls.some((url) => url.includes(`/midias/${edition}%20GTAP/full/`)), `amostra do álbum ${edition} (full)`);
  }
  assert.equal(new Set(urls).size, urls.length, 'sem duplicatas');
});
