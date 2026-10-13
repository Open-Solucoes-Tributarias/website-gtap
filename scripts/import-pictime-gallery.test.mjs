import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEntries, orderScenes, parseScenes } from './import-pictime-gallery.mjs';

const fixture = {
  version: 4,
  minId: 1000,
  scenes: [
    { nm: 'Segundo Dia', photos: [5, 0, 0, 0, 0, 9, 0, 0, 0, 0] },
    { nm: 'Highlights', photos: [] },
    { nm: 'Primeiro Dia', photos: [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0] },
  ],
};

test('parseScenes uses stride 5 for version >= 3 and ignores empty scenes', () => {
  assert.deepEqual(parseScenes(fixture), [
    { sceneName: 'Segundo Dia', photoIds: [1005, 1009] },
    { sceneName: 'Primeiro Dia', photoIds: [1001, 1002, 1003] },
  ]);
});

test('parseScenes uses stride 4 for older versions', () => {
  const legacy = { version: 2, minId: 10, scenes: [{ nm: 'Primeiro Dia', photos: [1, 0, 0, 0, 7, 0, 0, 0] }] };
  assert.deepEqual(parseScenes(legacy), [{ sceneName: 'Primeiro Dia', photoIds: [11, 17] }]);
});

test('orderScenes puts Primeiro Dia before Segundo Dia and unknown scenes last, stably', () => {
  const scenes = [
    { sceneName: 'Extra B', photoIds: [1] },
    { sceneName: 'Segundo Dia', photoIds: [2] },
    { sceneName: 'Extra A', photoIds: [3] },
    { sceneName: 'Primeiro Dia', photoIds: [4] },
  ];
  assert.deepEqual(orderScenes(scenes).map((s) => s.sceneName), ['Primeiro Dia', 'Segundo Dia', 'Extra B', 'Extra A']);
});

test('buildEntries numbers photos per scene with zero-padded counters', () => {
  const entries = buildEntries(orderScenes(parseScenes(fixture)));
  assert.deepEqual(entries.map((e) => e.id), ['dia-1-001', 'dia-1-002', 'dia-1-003', 'dia-2-001', 'dia-2-002']);
  assert.deepEqual(entries[0], {
    id: 'dia-1-001',
    photoId: 1001,
    url: '/galerias/x-gtap/full/dia-1-001.webp',
    thumb: '/galerias/x-gtap/thumb/dia-1-001.webp',
    scene: 'Primeiro Dia',
  });
  assert.equal(entries[3].scene, 'Segundo Dia');
});
