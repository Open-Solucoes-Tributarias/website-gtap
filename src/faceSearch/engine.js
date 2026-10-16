// Motor da busca facial no navegador. Tudo é carregado sob demanda (clique no botão);
// as páginas dos álbuns não trazem a biblioteca nem os modelos.
import { describeAll } from './describe';
import { averageDescriptors, search, unpackIndex } from './format';

export const FACE_BASE = '/face-search/';
// O MESMO detector da indexação (SSD): o recorte do rosto muda o descritor, e com o Tiny
// Face Detector a distância para o mesmo rosto indexado chegou a 0.47 (SSD: 0.07).
const MAX_SIDE = 640;
const MIN_SCORE = 0.5; // mais tolerante que o índice (0.6): a selfie tem um rosto só e luz pior
const MIN_FACE = 0.12; // largura do rosto em relação à imagem
const FRAMES = 3;

const once = (factory) => {
  let promise;
  return () => (promise ??= factory().catch((error) => {
    promise = undefined; // permite tentar de novo
    throw error;
  }));
};

const getJson = (url) => fetch(url).then((response) => {
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
});

export const loadManifest = once(() => getJson(`${FACE_BASE}manifest.json`));

const indexes = new Map();
export function loadIndex(albumKey) {
  if (!indexes.has(albumKey)) {
    indexes.set(albumKey, loadManifest().then(async (manifest) => {
      const album = manifest.albums?.[albumKey];
      if (!album) throw new Error('Álbum sem índice facial');
      const response = await fetch(FACE_BASE + album.file);
      if (!response.ok) throw new Error(`${album.file}: ${response.status}`);
      return { index: unpackIndex(await response.arrayBuffer()), photos: album.photos, thresholds: manifest.thresholds };
    }).catch((error) => {
      indexes.delete(albumKey);
      throw error;
    }));
  }
  return indexes.get(albumKey);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.faceapi) return resolve(window.faceapi);
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(window.faceapi);
    script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca'));
    document.head.append(script);
    return undefined;
  });
}

// Biblioteca + backend (WebGL, com CPU de reserva) + 3 modelos baixados em paralelo.
export const loadEngine = once(async () => {
  const manifest = await loadManifest();
  const faceapi = await loadScript(FACE_BASE + manifest.lib);
  const { tf } = faceapi;
  for (const backend of ['webgl', 'cpu']) {
    try {
      if (await tf.setBackend(backend)) break;
    } catch { /* tenta o próximo */ }
  }
  await tf.ready();
  tf.enableProdMode();
  const uri = FACE_BASE + manifest.models;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(uri),
    faceapi.nets.faceLandmark68Net.loadFromUri(uri),
    faceapi.nets.faceRecognitionNet.loadFromUri(uri),
  ]);
  await warmUp(faceapi);
  return faceapi;
});

// A primeira inferência compila shaders (WebGL) e leva segundos no celular: rodamos os 3 modelos uma
// vez com imagens em branco enquanto a pessoa ainda lê o aviso, para a primeira busca ser rápida.
async function warmUp(faceapi) {
  const blank = (size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  };
  try {
    await faceapi.detectAllFaces(blank(160), new faceapi.SsdMobilenetv1Options({ minConfidence: MIN_SCORE }));
    await faceapi.nets.faceLandmark68Net.detectLandmarks(blank(112));
    await faceapi.nets.faceRecognitionNet.computeFaceDescriptor(blank(150));
  } catch { /* aquecimento é só otimização */ }
}

// Reduz a imagem (câmera, upload) para detectar mais rápido.
export function toCanvas(source) {
  const width = source.videoWidth || source.naturalWidth || source.width;
  const height = source.videoHeight || source.naturalHeight || source.height;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// Descritor do rosto dominante da imagem (mesmo caminho do indexador, com luz normalizada).
// status: ok | none | multiple | small
export async function describeFace(faceapi, canvas) {
  const { width, height } = canvas;
  const { data } = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height);
  const found = await describeAll(faceapi, { data, width, height, channels: 4 }, { minConfidence: MIN_SCORE, boostDark: true });
  if (!found.length) return { status: 'none' };
  const area = (face) => face.box.width * face.box.height;
  const [main, second] = found.sort((a, b) => area(b) - area(a));
  if (second && area(second) > area(main) * 0.5) return { status: 'multiple' };
  if (main.box.width < width * MIN_FACE) return { status: 'small' };
  return { status: 'ok', descriptor: main.descriptor };
}

// Câmera: alguns quadros seguidos, descritor médio (mais estável do que um quadro só).
// onFrame(n, total) avisa o progresso para a interface.
export async function describeVideo(faceapi, video, onFrame = () => {}) {
  const descriptors = [];
  let last = { status: 'none' };
  for (let n = 0; n < FRAMES; n += 1) {
    onFrame(n + 1, FRAMES);
    last = await describeFace(faceapi, toCanvas(video));
    if (last.status === 'ok') descriptors.push(last.descriptor);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return descriptors.length ? { status: 'ok', descriptor: averageDescriptors(descriptors) } : last;
}

// Fotos dos álbuns parecidas com o descritor: [{ album, id, distance, strong }], da mais
// parecida para a menos. Carrega os índices que faltarem (todos juntos somam ~160 KB).
export async function findPhotos(albumKeys, descriptor) {
  const found = await Promise.all(albumKeys.map(async (album) => {
    const { index, photos, thresholds } = await loadIndex(album);
    return search(index, descriptor, thresholds.possible).map(({ photo, distance }) => ({
      album,
      id: photos[photo],
      distance,
      strong: distance <= thresholds.strong,
    }));
  }));
  return found.flat().sort((a, b) => a.distance - b.distance);
}
