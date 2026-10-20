# Busca facial na galeria ("Encontre suas fotos")

Plano de implementação e execução. Branch: `feat/busca-facial` (a partir da `main`). Tudo roda no navegador do visitante; o site continua 100% estático (`output: 'export'`) e o fluxo `dev → main → hostinger` não muda.

## 1. Como funciona

```
 build local (Node, 1x por álbum novo)                     site estático (Hostinger)             navegador do visitante
┌─────────────────────────────────────┐   versiona   ┌──────────────────────────────┐   ┌──────────────────────────────────────┐
│ npm run faces:index                 │ ───────────▶ │ public/face-search/          │   │ clique em "Encontre suas fotos"      │
│  fotos (servidor/cache) → detecta   │              │   manifest.json (no-cache)   │   │  1. baixa lib + modelos (~13 MB, 1x)  │
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
| Detector (selfie) | **o mesmo SSD MobileNet v1 do índice** | Medido: com o Tiny Face Detector o descritor do MESMO rosto ficou a 0.47 do indexado (equivale a outra pessoa); com SSD, 0.07. O detector define o recorte do rosto, então precisa ser igual no índice e na selfie. |
| Formato do índice | binário **int8 por álbum** (não JSON) | 128 B por rosto. ~3 mil rostos ≈ 400 KB no total, contra ~3 MB em JSON. Um álbum por arquivo: o visitante só baixa o álbum que está vendo. |
| Escopo da busca | **galeria (todas as edições)** e álbum aberto | Em `/galeria/` a busca percorre os 10 índices (~160 KB) e mostra as fotos agrupadas por edição, com link `/<edição>/#foto-N`. Na página do álbum o botão filtra a grade. Na busca geral só "alta confiança" aparece de início; as "possíveis" ficam atrás de um botão. |

## 3. Parâmetros de velocidade e precisão

**Indexação (`scripts/build-face-index.mjs`)**
- Entrada: a versão `full` (1600 px) de cada foto; rostos pequenos se perdem em `mid`.
- Descarta rosto com caixa < 64 px de lado ou score < 0.6 (descritores ruins geram falso positivo).
- Cache por foto em `.cache/faces/<álbum>/<id>.json`: reexecutar só processa fotos novas. O arquivo final é determinístico (ordem por id), então o hash do nome só muda quando o conteúdo muda.
- Quantização int8 com escala fixa (`round(v * 127 / 0.5)`), validada por teste: erro de distância < 0.02 (limiar é 0.5–0.6).

**Selfie (navegador)**
- Lib, modelos e índice são carregados **só ao clicar** (import dinâmico); `pointerenter`/`focus` no botão pré-busca apenas manifest e índice (poucos KB), nunca os ~12 MB de modelos.
- Modelos carregados em paralelo (`Promise.all`); SSD + Landmark68 + Recognition (~12,4 MB, uma vez; depois cache imutável).
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

**Já implementado:** página `/privacidade/` (link no rodapé e no sitemap) com a seção `#busca-facial`, e aceite obrigatório (checkbox com link para a política) no diálogo antes de câmera/upload, pedido a cada visita e sem gravar nada no aparelho. A política (`/privacidade/`) segue a estrutura da política da Plataforma GT (gestaotributaria.com.br) e traz razão social e CNPJ da Open (09.094.300/0001-51), encarregado (dpo@opensolucoestributarias.com.br), bases legais, compartilhamento (RD Station, Meta, hospedagem/CDN), transferência internacional (Meta) e cookies. **Pendente de revisão jurídica:** as bases legais propostas (inclusive a do índice facial de terceiros, dado sensível, e a das fotos), a existência do banner de consentimento para o Meta Pixel e a confirmação de que o e-mail do DPO está ativo.

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
- **Peso do primeiro uso**: ~13 MB uma vez (lib + modelos), depois cache imutável.
- **Fotos no servidor**: o indexador baixa de `gtap.com.br/midias/` (ou usa `.cache/midias`); se o servidor perder arquivos, a indexação falha de forma visível.

## 10. Estado da execução (16/10/2026)

- Índice gerado para as 10 edições (versão 3, com luz normalizada): 1.182 rostos em 519 fotos, ≈ 160 KB no total. Indexação completa em ~20 min (WASM, 1 processo; cache por foto, versão do cache em `CACHE_VERSION`).
- `public/face-search/` pesa ~14 MB no Git (lib 1,3 MB + modelos 12,4 MB).
- Teste local (`npm run preview`, WebGL): preparo na 1ª abertura ~5 s em localhost; busca ~1 s depois de aquecida (inclui compilar shaders). Selfie = foto do X GTAP com um rosto: 32 fotos, 15 em alta confiança.
- **Calibração (Fase 3) ainda pendente.** Observado: a mesma pessoa de perfil/com óculos fica em 0.47–0.55 da foto frontal, e pessoas diferentes também chegam a ~0.54. Por isso existem as duas faixas e o selo "Possível". Sem autorização das pessoas não validei com mais ninguém.
- Busca geral na galeria feita (Fase 4). Teste: a mesma foto deu 67 "alta confiança" com o detector Tiny (descritor do mesmo rosto a 0.47 do indexado) e 18 depois de trocar para o SSD usado no índice (0.07). **Detector da selfie = detector do índice, sempre.**
- Ordem dos resultados: na galeria a grade é uma lista só, da foto mais parecida para a menos (com a edição em cada miniatura), e o visualizador (`Lightbox`, extraído do `AlbumGrid`) percorre exatamente essa ordem, com legenda da edição e link "Ver no álbum". Antes o clique abria o álbum na ordem normal.
- Não feito: Web Worker (UI não trava; ver se precisa em celular antigo), banner de cookies.

## 11. Luz e qualidade da selfie (16/10/2026)

Relato: a selfie "não achava rosto" ou não casava com pouca luz ou fundo escuro. O que medimos:

- **A detecção aguenta pouca luz; o reconhecimento não.** Foto escurecida por fator (distância do descritor ao da foto original): ×0.7 → 0.23, ×0.5 → 0.30, ×0.25 → 0.29. O limiar de alta confiança é 0.50, então só a luz já consumia metade da margem.
- **Normalização de luz por rosto** (`src/faceSearch/describe.js`, compartilhado entre o indexador e o navegador): detecta → recorta o rosto com folga → ajusta o ganho para o centro do rosto ir a luma 125 → redetecta no recorte → descritor. A mesma série cai para 0.05–0.15. Normalização por gama foi testada e piorou (descartada). Foto estourada (clipada) não tem conserto.
- **Redetecção no recorte:** a 0.3 só 84% dos rostos eram redetectados; há uma segunda tentativa a 0.03 que só vale se a caixa for plausível (centro do recorte, ≥ 20% da largura). Sem ela o índice perdia ~15% dos rostos (1.054 vs 1.241).
- **Quadro escuro na câmera (só navegador, `boostDark`):** o SSD do rosto grande caiu a 0.27 (abaixo do limiar) num quadro com luma média 38 e voltou a 0.83 com ganho global antes da detecção. Sem isso a selfie escura virava "não encontramos um rosto".
- **Resultado (câmera simulada, rosto ocupando o quadro):** normal → 10 fotos de alta confiança; 50% de brilho → 19 (5 em comum); 30% → 13 (6 em comum); 15% → 48 (2 em comum, luz extrema). Detecta em todos os níveis, mas o dlib continua sensível: pouca luz aumenta o ruído. Se isso incomodar na prática, o próximo passo é trocar o modelo (ArcFace).
- **Resolução também pesa:** descritor do mesmo rosto vs. índice (1600 px): 1000 px → 0.07, 640 px → 0.12, 480 px → 0.18. Por isso a selfie deve ocupar bem o quadro.
- **Feedback do botão:** a primeira análise trava a thread principal por segundos no celular; agora o estado "ocupado" é pintado antes da conta (`nextPaint`), o motor é aquecido ao abrir a busca (`warmUp`) e o botão, a prévia e a linha de status mostram o progresso (animações só com `transform`).
- **Mudou `describe.js`? Reindexe** (`CACHE_VERSION` + `npm run faces:index`): o índice e a selfie precisam usar exatamente o mesmo caminho.

## 12. Carregamento sem espera (20/10/2026)

Relato (iPhone): o diálogo ficava em "Preparando a busca… baixamos cerca de 12 MB" na primeira vez. Mudanças:

- **Pré-carga na página** (`preloadEngine`, `src/faceSearch/engine.js`): quando a barra "Encontre suas fotos" chega perto da tela (`IntersectionObserver`, margem de 300 px) e a conexão permite (sem `saveData`, fora de 2G), o navegador baixa lib + modelos + índices no tempo ocioso. Em conexão lenta/econômica só carrega por intenção (hover, foco, clique). A pré-carga é idempotente.
- **Baixa uma vez, usa da memória:** lib por Blob URL e pesos por `tf.io.decodeWeights` + `loadFromWeightMap`, sem depender do cache HTTP (antes o `loadFromUri` baixava os modelos de novo). Os tamanhos vêm do `manifest.preload` (`npm run faces:assets`) e dão o progresso real.
- **Diálogo já mostra as ações:** aceite, "Tirar uma selfie" e "Enviar uma foto minha" aparecem de imediato; uma faixa "Preparando a busca…" (spinner, % e barra dourada, só com `transform`) fica acima enquanto carrega e some quando pronto. Sem texto de MB. Se a pessoa já abrir a câmera ou escolher a foto antes de terminar, a análise espera sozinha ("Preparando…") e segue.
- **Botão da barra:** fio de progresso na base enquanto pré-carrega (o botão já funciona).
- **Lento/erro:** sem avanço por 20 s → "Está demorando mais que o normal" + "Tentar de novo"; falha → mensagem + "Tentar de novo".
- **Hidratação:** `hasCamera` é decidido depois da hidratação (o diálogo vem desenhado no HTML e o servidor não sabe se há câmera).
- **Não verificado:** iPhone real. No emulador de celular (sem GPU) a pré-carga leva ~2 s localmente e o fluxo completo (clique antes de terminar → câmera → captura → resultado) funciona com rede simulada lenta.
