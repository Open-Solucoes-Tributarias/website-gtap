# Busca facial na galeria ("Encontre suas fotos")

Plano de implementação e execução. Branch: `feat/busca-facial` (a partir da `main`). Tudo roda no navegador do visitante; o site continua 100% estático (`output: 'export'`) e o fluxo `dev → main → hostinger` não muda.

## 1. Como funciona

```
 build local (Node, 1x por álbum novo)                     site estático (Hostinger)             navegador do visitante
┌─────────────────────────────────────┐   versiona   ┌──────────────────────────────┐   ┌──────────────────────────────────────┐
│ npm run faces:index                 │ ───────────▶ │ public/face-search/          │   │ clique em "Encontre suas fotos"      │
│  fotos (servidor/cache) → detecta   │              │   manifest.json (no-cache)   │   │  1. baixa lib + modelos (~7 MB, 1x)  │
│  rostos → descritor 128-d → int8    │              │   data/<álbum>.<hash>.bin    │──▶│  2. selfie/upload → descritor 128-d  │
│  → data/<álbum>.<hash>.bin          │              │   models/*.<hash>.bin        │   │  3. distância euclidiana vs. .bin    │
└─────────────────────────────────────┘              │   lib/face-api.<hash>.js     │   │  4. filtra a grade do álbum          │
                                                      └──────────────────────────────┘   └──────────────────────────────────────┘
```

- A selfie **nunca sai do aparelho**. Não existe backend nem API.
- O navegador não varre fotos: só compara a selfie com um vetor pré-calculado (centenas de KB). A busca em si leva < 5 ms; o custo real é carregar modelos e detectar o rosto da selfie.
- Os descritores são gerados **com os mesmos pesos** (dlib ResNet, 128-d) no Node e no navegador. Misturar modelos diferentes invalida a comparação.

## 2. Decisões

| Tema | Decisão | Por quê |
|---|---|---|
| Biblioteca | `@vladmandic/face-api` 1.7.15 | O `face-api.js` original está abandonado (TF.js 1.x). O fork mantém a mesma API e os mesmos modelos de 128-d, com TF.js 4. |
| Indexação (Node) | TF.js com backend **WASM** (+ `sharp` para decodificar) | `tfjs-node` exige binário nativo e costuma quebrar no Node 24/Windows. WASM roda igual em qualquer máquina e o custo é só de build. |
| Detector (índice) | SSD MobileNet v1, `minConfidence` 0.6 | Mais preciso em rostos pequenos de fotos de grupo; o tempo não importa offline. |
| Detector (selfie) | Tiny Face Detector, `inputSize` 320 | 190 KB e dezenas de ms; basta para um rosto grande e frontal. |
| Formato do índice | binário **int8 por álbum** (não JSON) | 128 B por rosto. ~3 mil rostos ≈ 400 KB no total, contra ~3 MB em JSON. Um álbum por arquivo: o visitante só baixa o álbum que está vendo. |
| Escopo da busca (MVP) | álbum aberto | Combina com o `AlbumGrid` (filtra a grade existente). "Todas as edições" fica para a Fase 4. |

## 3. Parâmetros de velocidade e precisão

**Indexação (`scripts/build-face-index.mjs`)**
- Entrada: a versão `full` (1600 px) de cada foto; rostos pequenos se perdem em `mid`.
- Descarta rosto com caixa < 64 px de lado ou score < 0.6 (descritores ruins geram falso positivo).
- Cache por foto em `.cache/faces/<álbum>/<id>.json`: reexecutar só processa fotos novas. O arquivo final é determinístico (ordem por id), então o hash do nome só muda quando o conteúdo muda.
- Quantização int8 com escala fixa (`round(v * 127 / 0.5)`), validada por teste: erro de distância < 0.02 (limiar é 0.5–0.6).

**Selfie (navegador)**
- Lib, modelos e índice são carregados **só ao clicar** (import dinâmico); `pointerenter`/`focus` no botão pré-busca apenas manifest e índice (poucos KB), nunca os 7 MB de modelos.
- Modelos carregados em paralelo (`Promise.all`); só os necessários: Tiny Face Detector + Landmark68 + Recognition (~6,7 MB). O SSD não é baixado.
- Backend `webgl`, com fallback para `wasm` e depois `cpu`; `tf.enableProdMode()`; uma inferência de aquecimento após o carregamento.
- Imagem reduzida para no máximo 640 px antes de detectar; câmera pede 640×480.
- Câmera: 3 quadros, descritor médio (mais estável que um quadro só). Upload: 1 imagem. Exige exatamente um rosto dominante.
- Limiares (distância euclidiana): ≤ 0.50 "alta confiança", ≤ 0.55 "possíveis". Calibrar com fotos reais (Fase 3). Resultado ordenado por distância.

**Estático / Hostinger**
- `public/face-search/` é copiado para `out/`; nada novo no servidor, nada fora do fluxo atual.
- Arquivos pesados com **hash no nome** (`.bin`, `.js`) → cache imutável de 1 ano. `manifest.json` e o JSON de pesos dos modelos ficam `no-cache` (regra de `.json` já existente) e apontam para os nomes com hash.
- `.htaccess`: nova regra `Cache-Control: immutable` só para `*.<hash10>.bin` (o hash garante que atualizar o conteúdo muda a URL). Sem DEFLATE para `.bin`: pesos de rede neural e vetores int8 quase não comprimem. A lib `.js` (1,3 MB, ~350 KB comprimida) já cai nas regras de `js`. Alterar nos **três** lugares (raiz, `public/`, produção).
- Páginas dos álbuns continuam sem a lib: o componente só importa tudo sob demanda (orçamento de `<script src>` do `verify-export` não deve estourar).
- Nenhuma dessas pastas colide com `midias/` ou `sorteio/`.

## 4. Interface

- No `AlbumGrid`, ao lado dos chips de dia: botão **"Encontre suas fotos"** (só aparece se existir índice para o álbum e o navegador tiver `getUserMedia`/`<input type=file>`).
- `<dialog>` com: aviso de privacidade em uma linha ("a selfie é processada no seu aparelho e não é enviada"), botão de câmera, botão de enviar foto, estados (carregando modelos, procurando, nenhum rosto, vários rostos, sem resultados, erro).
- Resultado: a grade passa a mostrar só as fotos encontradas (chip "Minhas fotos · N" ativo, com "Limpar"); o visualizador continua funcionando sobre a lista filtrada. Acessível: `aria-live` nos estados, foco devolvido ao botão.
- Sem JS, o álbum continua exatamente como hoje.

## 5. Privacidade e LGPD (decidir antes de publicar)

**Já implementado:** página `/privacidade/` (link no rodapé e no sitemap) com a seção `#busca-facial`, e aceite obrigatório (checkbox com link para a política) no diálogo antes de câmera/upload, pedido a cada visita e sem gravar nada no aparelho. **Pendente de revisão jurídica:** razão social/CNPJ do controlador, canal formal de privacidade (hoje o formulário de contato), prazo de 15 dias para remoção, base legal e se o Meta Pixel exige banner de cookies.

- Os descritores publicados são **dados biométricos de todas as pessoas que aparecem nas fotos** (LGPD, art. 5º II e 11: dado pessoal sensível). Qualquer pessoa pode baixar o `.bin`. Isso é diferente da selfie, que não sai do aparelho.
- Mitigações previstas: aviso e canal de descadastro (remover fotos/rosto do índice e republicar); revisão jurídica/termo de consentimento da inscrição no evento; começar só pelo X GTAP (mais recente) para limitar o escopo; não publicar caixas nem nomes, só vetores; sem analytics da selfie.
- Esta é uma decisão do negócio. O código fica pronto, mas **não vai à `main` sem esse aval**.

## 6. Arquivos

| Arquivo | Papel |
|---|---|
| `scripts/face-index-lib.mjs` | quantização, empacotamento/leitura do `.bin`, distância (puro, testável) |
| `scripts/face-index-lib.test.mjs` | testes do formato e do erro de quantização |
| `scripts/build-face-index.mjs` | `npm run faces:index [-- --album x-gtap]`: gera `public/face-search/data` + `manifest.json` |
| `scripts/prepare-face-assets.mjs` | `npm run faces:assets`: copia lib e modelos do pacote para `public/face-search/` com hash no nome |
| `src/faceSearch/matcher.js` | leitura do `.bin` e ranking (sem dependência de DOM) |
| `src/faceSearch/engine.js` | carrega a lib, backend e modelos; descritor da selfie |
| `src/views/galeria/galeriaEdition/FaceSearch.jsx/.css` | UI (botão, `<dialog>`, estados) |
| `AlbumGrid.jsx` | recebe os ids encontrados e filtra a lista |
| `.htaccess` (×3), `verify-export.mjs`, workflows | regras de cache e checagens |

## 7. Fases e critérios de aceite

1. **Dados** – `faces:assets` e `faces:index` rodam local; `manifest.json` lista os álbuns; teste de formato verde. *Aceite:* tamanho total do índice < 600 KB e nenhuma foto sem nenhum rosto sem log explicando.
2. **Motor + UI** – botão, selfie por upload e câmera, filtro da grade. *Aceite:* no `npm run preview` (build estático), buscar uma selfie de uma pessoa presente no X GTAP retorna as fotos dela.
3. **Calibração** – testar com 5–10 pessoas conhecidas (com autorização) e ajustar limiares/tamanho mínimo. *Aceite:* sem falso positivo evidente no nível "alta confiança".
4. **Todas as edições** (opcional) – carregar vários álbuns e linkar para `/<edição>/#foto-N`.
5. **Produção** – revisar privacidade (seção 5), triplo `.htaccess`, `npm run lint && npm run build && npm run verify:export`, merge `dev → main` como no `AGENTS.md`, `npm run verify:prod`.

## 8. Testar localmente

```sh
npm ci
npm run faces:assets          # copia lib e modelos (uma vez)
npm run faces:index           # indexa todos os álbuns (lento na 1ª vez; retoma do cache)
npm run build && npm run verify:export
npm run preview               # http://127.0.0.1:4173 (localhost permite a câmera sem HTTPS)
```

## 9. Riscos

- **Precisão**: o modelo 128-d é inferior a ArcFace em rostos de perfil/pequenos/com óculos escuros. Mitigação: duas faixas de confiança e orientação de selfie frontal. Plano B: trocar o motor por ONNX/ArcFace (512-d) mantendo o mesmo formato de índice, só mudando `DIM`.
- **iOS/Android antigos**: WebGL limitado → fallback WASM é mais lento (alguns segundos). Aceitável; a UI mostra progresso.
- **Peso do primeiro uso**: ~7 MB uma vez, depois cache imutável.
- **Fotos no servidor**: o indexador baixa de `gtap.com.br/midias/` (ou usa `.cache/midias`); se o servidor perder arquivos, a indexação falha de forma visível.

## 10. Estado da execução (16/10/2026)

- Índice gerado para as 10 edições: 1.241 rostos em 522 fotos, **≈ 160 KB no total** (X GTAP: 50 KB, 179 de 226 fotos). Indexação completa em ~5 min (WASM, cache por foto).
- `public/face-search/` pesa 8,2 MB no Git (lib 1,3 MB + modelos 7 MB; só os modelos da selfie).
- Teste local (`npm run preview`, WebGL): preparo na 1ª abertura ~5 s em localhost; busca ~1 s depois de aquecida (inclui compilar shaders). Selfie = foto do X GTAP com um rosto: 32 fotos, 15 em alta confiança.
- **Calibração (Fase 3) ainda pendente.** Observado: a mesma pessoa de perfil/com óculos fica em 0.47–0.55 da foto frontal, e pessoas diferentes também chegam a ~0.54. Por isso existem as duas faixas e o selo "Possível". Sem autorização das pessoas não validei com mais ninguém.
- Não feito: modo "todas as edições" (Fase 4), Web Worker (UI não trava; ver se precisa em celular antigo), banner de cookies.
