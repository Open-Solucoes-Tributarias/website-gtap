import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRdBody,
  captureTracking,
  formatPhone,
  isValidEmail,
  isValidPhone,
  RD_ENDPOINT,
  RD_IDENTIFIER,
  sendConversion,
} from '../src/Utils/leadForm.js';

const memoryStorage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) };
};

test('RD body uses the site identifier and the RD field names', () => {
  const body = buildRdBody({ name: ' Ana Souza ', email: ' ana@prefeitura.ba.gov.br ', phone: '(71) 99999-0000' }, {});
  assert.equal(body.identificador, RD_IDENTIFIER);
  assert.equal(RD_IDENTIFIER, 'site-gtap-xi');
  assert.match(body.token_rdstation, /^[a-f0-9]{32}$/);
  assert.equal(body.name, 'Ana Souza');
  assert.equal(body.email, 'ana@prefeitura.ba.gov.br');
  assert.equal(body.mobile_phone, '(71) 99999-0000');
  // Sem UTMs, os campos cf_* não vão vazios para o RD.
  assert.equal(Object.keys(body).some((key) => key.startsWith('cf_')), false);
});

test('RD body carries UTMs and placement as cf_* fields', () => {
  const body = buildRdBody({ name: 'Ana', email: 'a@b.com', phone: '71999990000' }, { utm_source: 'meta', utm_campaign: 'xi', placement: 'feed' });
  assert.equal(body.cf_utm_source, 'meta');
  assert.equal(body.cf_utm_campaign, 'xi');
  assert.equal(body.cf_placement, 'feed');
  assert.equal('cf_utm_medium' in body, false);
});

test('tracking keeps the first-visit UTMs for the session', () => {
  const storage = memoryStorage();
  assert.deepEqual(captureTracking('?utm_source=meta&utm_medium=cpc&fbclid=x', storage), { utm_source: 'meta', utm_medium: 'cpc' });
  // Navegação seguinte sem UTMs: mantém as da sessão; novas UTMs substituem.
  assert.deepEqual(captureTracking('', storage), { utm_source: 'meta', utm_medium: 'cpc' });
  assert.deepEqual(captureTracking('?utm_source=google', storage), { utm_source: 'google', utm_medium: 'cpc' });
  // Sem sessionStorage (modo privado/bloqueado): só a URL atual.
  assert.deepEqual(captureTracking('?utm_term=a', null), { utm_term: 'a' });
});

test('phone and e-mail validation and mask', () => {
  assert.equal(isValidPhone('(71) 99999-0000'), true);
  assert.equal(isValidPhone('(71) 3333-0000'), true);
  assert.equal(isValidPhone('9999-0000'), false);
  assert.equal(isValidEmail('ana@prefeitura.ba.gov.br'), true);
  assert.equal(isValidEmail('ana@prefeitura'), false);
  assert.equal(formatPhone('71999990000'), '(71) 99999-0000');
  assert.equal(formatPhone('7133330000'), '(71) 3333-0000');
  assert.equal(formatPhone('719'), '(71) 9');
  assert.equal(formatPhone('7199999000099'), '(71) 99999-0000');
});

test('conversion posts JSON to RD and rejects on HTTP error', async () => {
  const calls = [];
  const ok = async (url, init) => { calls.push([url, init]); return { ok: true, status: 200 }; };
  await sendConversion({ name: 'Ana' }, ok);
  assert.equal(calls[0][0], RD_ENDPOINT);
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0][1].body), { name: 'Ana' });
  await assert.rejects(sendConversion({}, async () => ({ ok: false, status: 400 })), /RD Station 400/);
});
