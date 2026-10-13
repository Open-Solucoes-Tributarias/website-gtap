// Envio do formulário de contato direto para o RD Station (API de conversões 1.3),
// no mesmo formato da LP do congresso (LP.opensolucoestributarias/assets/js/lead-form.js).
// O token é o público do RD (feito para uso no navegador), não uma chave privada.
export const RD_ENDPOINT = "https://www.rdstation.com.br/api/1.3/conversions";
export const RD_TOKEN = "fde56b5029b7f481d3f10fecb3f1de85";
export const RD_IDENTIFIER = "site-gtap-xi";
export const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "placement"];

const STORAGE_PREFIX = "gtap_";

/** UTMs/placement da URL; os da primeira visita valem para a sessão inteira. */
export function captureTracking(search, storage) {
  const params = new URLSearchParams(search);
  const tracking = {};
  for (const key of TRACKING_KEYS) {
    const fromUrl = params.get(key);
    let value = fromUrl;
    try {
      if (fromUrl) storage?.setItem(STORAGE_PREFIX + key, fromUrl);
      else value = storage?.getItem(STORAGE_PREFIX + key) ?? null;
    } catch {
      // sessionStorage bloqueado (modo privado, cookies desativados): só a URL atual.
    }
    if (value) tracking[key] = value;
  }
  return tracking;
}

export function buildRdBody({ name, email, phone }, tracking = {}) {
  const body = {
    token_rdstation: RD_TOKEN,
    identificador: RD_IDENTIFIER,
    name: name.trim(),
    email: email.trim(),
    mobile_phone: phone.trim(),
  };
  // Campos personalizados só quando preenchidos (o RD não recebe cf_* vazios).
  for (const key of TRACKING_KEYS) {
    if (tracking[key]) body[`cf_${key}`] = tracking[key];
  }
  return body;
}

export const isValidEmail = (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());

export function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

/** Máscara (00) 00000-0000 / (00) 0000-0000 enquanto a pessoa digita. */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = `(${digits.slice(0, 2)}) `;
  const rest = digits.slice(2);
  if (digits.length <= 6) return ddd + rest;
  const split = digits.length === 11 ? 5 : 4;
  return `${ddd}${rest.slice(0, split)}-${rest.slice(split)}`;
}

export async function sendConversion(body, fetchImpl = fetch) {
  const response = await fetchImpl(RD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`RD Station ${response.status}`);
  return response;
}
