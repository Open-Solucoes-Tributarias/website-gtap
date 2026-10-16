// Descritor facial com luz normalizada. Código compartilhado pelo indexador (Node, pixels do
// sharp com 3 canais) e pelo navegador (ImageData, 4 canais): os dois PRECISAM usar exatamente
// este caminho, senão a distância entre a selfie e o índice perde o sentido.
//
// Por quê: o descritor do dlib reage muito à luz. Medido com uma foto escurecida por um fator
// (distância ao descritor da foto original): ×0.7 → 0.23; ×0.5 → 0.30; ×0.25 → 0.29 (o limiar de
// "alta confiança" é 0.50). Normalizando o brilho do rosto antes de calcular, a mesma série cai
// para 0.05–0.15. A detecção em si aguenta bem a pouca luz (score 0.70 em ×0.25).
//
// Caminho: detecta os rostos na imagem inteira → para cada um, recorta com folga, ajusta o ganho
// para que a luminância do centro do rosto vá a TARGET_LUMA → detecta de novo no recorte e calcula
// pontos + descritor. O recorte também reduz a influência do fundo.

export const TARGET_LUMA = 125;
const CROP_MARGIN = 0.5; // folga em volta da caixa do rosto (fração da caixa)
const GAIN_MIN = 0.5;
const GAIN_MAX = 3;
// Só no navegador (boostDark): quadros escuros ganham brilho global ANTES da detecção. Medido numa selfie escura
// de câmera: o score do SSD no rosto grande caiu a 0.27 (abaixo do limiar) e voltou a 0.83 com o ganho.
const DARK_LUMA = 100;
const DETECT_LUMA = 110;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Luminância média do centro do rosto (60% da caixa), em 0–255.
function faceLuma({ data, width, height, channels }, box) {
  const x0 = clamp(Math.round(box.x + box.width * 0.2), 0, width - 1);
  const x1 = clamp(Math.round(box.x + box.width * 0.8), x0 + 1, width);
  const y0 = clamp(Math.round(box.y + box.height * 0.2), 0, height - 1);
  const y1 = clamp(Math.round(box.y + box.height * 0.8), y0 + 1, height);
  let sum = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * channels;
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
  }
  return sum / ((x1 - x0) * (y1 - y0));
}

// Recorte (RGB) em volta do rosto, já com o ganho de luz aplicado.
export function cropNormalized(image, box) {
  const { data, width, height, channels } = image;
  const x0 = clamp(Math.floor(box.x - box.width * CROP_MARGIN), 0, width - 1);
  const y0 = clamp(Math.floor(box.y - box.height * CROP_MARGIN), 0, height - 1);
  const x1 = clamp(Math.ceil(box.x + box.width * (1 + CROP_MARGIN)), x0 + 1, width);
  const y1 = clamp(Math.ceil(box.y + box.height * (1 + CROP_MARGIN)), y0 + 1, height);
  const cropWidth = x1 - x0;
  const cropHeight = y1 - y0;
  const gain = clamp(TARGET_LUMA / Math.max(faceLuma(image, box), 1), GAIN_MIN, GAIN_MAX);
  const out = new Uint8Array(cropWidth * cropHeight * 3);
  let o = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * channels;
      out[o] = Math.min(255, Math.round(data[i] * gain));
      out[o + 1] = Math.min(255, Math.round(data[i + 1] * gain));
      out[o + 2] = Math.min(255, Math.round(data[i + 2] * gain));
      o += 3;
    }
  }
  return { data: out, width: cropWidth, height: cropHeight, gain };
}

// RGB com ganho global se o quadro for escuro; null se o brilho já está bom.
function brightened({ data, width, height, channels }) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += channels * 7) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    count += 1;
  }
  const mean = sum / Math.max(count, 1);
  if (mean >= DARK_LUMA) return null;
  const gain = clamp(DETECT_LUMA / Math.max(mean, 1), 1, GAIN_MAX);
  const out = new Uint8Array(width * height * 3);
  for (let i = 0, o = 0; i < data.length; i += channels, o += 3) {
    out[o] = Math.min(255, Math.round(data[i] * gain));
    out[o + 1] = Math.min(255, Math.round(data[i + 1] * gain));
    out[o + 2] = Math.min(255, Math.round(data[i + 2] * gain));
  }
  return out;
}

function rgbOf({ data, width, height, channels }) {
  if (channels === 3) return data;
  const out = new Uint8Array(width * height * 3);
  for (let i = 0, o = 0; i < data.length; i += channels, o += 3) {
    out[o] = data[i];
    out[o + 1] = data[i + 1];
    out[o + 2] = data[i + 2];
  }
  return out;
}

// image: { data, width, height, channels: 3 | 4 }. Retorna [{ score, box: {x,y,width,height}, descriptor }].
export async function describeAll(faceapi, image, { minConfidence = 0.5, boostDark = false } = {}) {
  const { tf } = faceapi;
  // A detecção usa o quadro clareado (se escuro); o recorte e o descritor saem dos pixels originais.
  const detectPixels = (boostDark && brightened(image)) || rgbOf(image);
  const full = tf.tensor3d(detectPixels, [image.height, image.width, 3], 'int32');
  let detections;
  try {
    detections = await faceapi.detectAllFaces(full, new faceapi.SsdMobilenetv1Options({ minConfidence }));
  } finally {
    full.dispose();
  }
  const faces = [];
  for (const detection of detections) {
    const crop = cropNormalized(image, detection.box);
    const tensor = tf.tensor3d(crop.data, [crop.height, crop.width, 3], 'int32');
    try {
      // Caixas fracas podem ser degeneradas e fazer o recorte da biblioteca falhar: tratamos como "sem rosto".
      const run = async (confidence) => {
        try {
          return await faceapi
            .detectSingleFace(tensor, new faceapi.SsdMobilenetv1Options({ minConfidence: confidence }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        } catch {
          return null;
        }
      };
      let found = await run(0.3);
      if (!found) {
        // Medido: só 84% dos rostos são redetectados no recorte a 0.3 (100% a 0.03). Na segunda tentativa
        // aceitamos a caixa mais forte, mas só se ela for plausível (no centro do recorte e com tamanho de
        // rosto): caixas degeneradas derrubam o recorte interno da biblioteca, e assim não descrevemos
        // um vizinho nem um falso positivo.
        const [top] = (await faceapi.detectAllFaces(tensor, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.03 })))
          .sort((x, y) => y.score - x.score);
        const off = (center, size) => Math.abs(center - size / 2) / size;
        const plausible = top
          && top.box.width >= crop.width * 0.2
          && off(top.box.x + top.box.width / 2, crop.width) <= 0.25
          && off(top.box.y + top.box.height / 2, crop.height) <= 0.25;
        if (plausible) found = await run(0.03); // a mais forte é a mesma que acabamos de validar
      }
      if (found) {
        const { x, y, width, height } = detection.box;
        faces.push({ score: detection.score, box: { x, y, width, height }, descriptor: found.descriptor });
      }
    } finally {
      tensor.dispose();
    }
  }
  return faces;
}
