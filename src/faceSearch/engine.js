// Motor da busca facial no navegador. As páginas não trazem a biblioteca nem os modelos no HTML:
// preloadEngine() baixa tudo (uma vez, para a memória) quando a barra da busca aparece na tela (ou na
// intenção: hover, foco, clique), com progresso, para o diálogo já abrir pronto.
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

// Lê o arquivo inteiro contando bytes (progresso). Os arquivos pesados são baixados UMA vez e usados da
// memória (script por Blob URL, pesos por decodeWeights): não dependemos do cache HTTP para não baixar de novo.
async function fetchBuffer(url, onBytes) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const reader = response.body?.getReader?.();
  if (!reader) {
    const whole = await response.arrayBuffer();
    onBytes(whole.byteLength);
    return whole;
  }
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    onBytes(value.length);
  }
  return new Blob(chunks).arrayBuffer();
}

// Fração de bytes já baixados (0–1); a pré-carga conecta isto ao progresso da interface.
let reportBytes = () => {};

// Biblioteca + pesos dos 3 modelos, em paralelo. { 'lib/x.js': ArrayBuffer, 'models/y.bin': ArrayBuffer }
const loadAssets = once(async () => {
  const manifest = await loadManifest();
  const files = manifest.preload ?? [];
  const total = files.reduce((sum, file) => sum + file.bytes, 0) || 1;
  let got = 0;
  const entries = await Promise.all(files.map(async (file) => [
    file.path,
    await fetchBuffer(FACE_BASE + file.path, (bytes) => {
      got += bytes;
      reportBytes(Math.min(got / total, 1));
    }),
  ]));
  return Object.fromEntries(entries);
});

function loadLibrary(buffer) {
  if (window.faceapi) return Promise.resolve(window.faceapi);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([buffer], { type: 'text/javascript' }));
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      URL.revokeObjectURL(url);
      resolve(window.faceapi);
    };
    script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca'));
    document.head.append(script);
  });
}

// Biblioteca + backend (WebGL, com CPU de reserva) + 3 modelos carregados dos bytes já baixados.
export const loadEngine = once(async () => {
  const manifest = await loadManifest();
  const assets = await loadAssets();
  const faceapi = await loadLibrary(assets[manifest.lib]);
  const { tf } = faceapi;
  for (const backend of ['webgl', 'cpu']) {
    try {
      if (await tf.setBackend(backend)) break;
    } catch { /* tenta o próximo */ }
  }
  await tf.ready();
  tf.enableProdMode();
  const nets = {
    ssd_mobilenetv1_model: faceapi.nets.ssdMobilenetv1,
    face_landmark_68_model: faceapi.nets.faceLandmark68Net,
    face_recognition_model: faceapi.nets.faceRecognitionNet,
  };
  await Promise.all(Object.entries(nets).map(async ([name, net]) => {
    const [group] = await getJson(`${FACE_BASE}${manifest.models}/${name}-weights_manifest.json`);
    const weights = assets[`${manifest.models}/${group.paths[0]}`];
    net.loadFromWeightMap(tf.io.decodeWeights(weights, group.weights));
  }));
  await warmUp(faceapi);
  return faceapi;
});

// ---- Estado da pré-carga (lido pela interface via useSyncExternalStore) ----
const STALL_MS = 20000; // sem avançar por tanto tempo = "está demorando"
const IDLE_STATUS = { state: 'idle', progress: 0, stalled: false };
let status = IDLE_STATUS;
const listeners = new Set();
function setStatus(patch) {
  status = { ...status, ...patch };
  listeners.forEach((listener) => listener());
}
export const getEngineStatus = () => status;
export const getServerStatus = () => IDLE_STATUS;
export const subscribeEngine = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let preloading;
// Baixa lib + modelos (com progresso), carrega os índices dos álbuns e prepara o motor.
// Idempotente: chamadas repetidas devolvem a mesma promessa. Resolve com o faceapi pronto.
export function preloadEngine(albumKeys = []) {
  if (preloading) return preloading;
  setStatus({ state: 'loading', progress: 0.02, stalled: false });
  let lastMove = Date.now();
  const watchdog = setInterval(() => {
    if (status.state === 'loading' && Date.now() - lastMove > STALL_MS) setStatus({ stalled: true });
  }, 4000);
  const move = (progress) => {
    lastMove = Date.now();
    setStatus({ progress: Math.max(status.progress, Math.min(progress, 0.99)), stalled: false });
  };
  reportBytes = (fraction) => move(0.05 + 0.85 * fraction);
  preloading = (async () => {
    await Promise.all([loadAssets(), ...albumKeys.map((album) => loadIndex(album))]);
    move(0.92); // o resto (nets + aquecimento) não tem como medir: a interface mostra varredura
    const faceapi = await loadEngine();
    clearInterval(watchdog);
    setStatus({ state: 'ready', progress: 1, stalled: false });
    return faceapi;
  })().catch((error) => {
    clearInterval(watchdog);
    preloading = undefined;
    setStatus({ state: 'error', progress: 0, stalled: false });
    throw error;
  });
  return preloading;
}

// "Tentar de novo" depois de erro ou lentidão: recomeça (o que já está em cache sai de lá).
export function retryEngine(albumKeys = []) {
  preloading = undefined;
  return preloadEngine(albumKeys);
}

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
