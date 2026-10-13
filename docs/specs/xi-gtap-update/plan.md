# Plan — XI GTAP (2026)

Spec: `docs/specs/xi-gtap-update/spec.md` (autoridade).

## Global Constraints
- Next 16 static export (`output: 'export'`, `trailingSlash: true`); sem next/image; imagens via `ResponsiveImage`.
- Testes com `node --test` em `scripts/*.test.mjs` (sem novos frameworks). Lint `npm run lint` deve passar.
- `sharp` (já dependência) para todo processamento de imagem. Sem novas dependências.
- Rede: comandos que baixam da pic-time precisam de `allowed_domains: ["pictime7eus1public-pub-hdf3hecqdpaqeuev.a02.azurefd.net"]` no Bash.
- Execução em ondas paralelas: tarefas da mesma onda tocam arquivos **disjuntos**. Cada implementer só faz `git add` dos próprios caminhos (nunca `git add -A`/`.`); se der `index.lock`, espere 5s e tente de novo.
- Copy em pt-BR. Seguir estilo do código vizinho (JSX funcional, CSS por componente).
- Contrato de dados XI (produzido pela T2, consumido por T3/T4):
  `public/api/galerias/xi-gtap.json` = `[{ "id": "dia-1-001", "url": "/galerias/xi-gtap/full/dia-1-001.webp", "thumb": "/galerias/xi-gtap/thumb/dia-1-001.webp", "width": 1600, "height": 1065, "scene": "Primeiro Dia" }, …]`
- Contrato de logos (produzido pela T1, consumido pela T3): `public/assets/logos/xigtap.webp`.

## Ondas
- Onda 1 (paralelo): T1, T2
- Onda 2 (paralelo, após T1+T2): T3, T4
- Final: revisão do branch inteiro, build + verify:export + QA no browser

---

### Task 1: Logo XI GTAP (R1)
Arquivos: `scripts/generate-logo-assets.mjs` (novo), `scripts/generate-logo-assets.test.mjs` (novo), `scripts/assets/logo-xi-gtap-source.jpg` (já existe, arte-fonte 2000x627 fundo preto), saídas em `public/` (`logo-xi-gtap.webp`, `logo-xi-gtap-light.webp`, `og-gtap.png`, `assets/logos/xigtap.webp`) e ícones (`app/icon.png` + `app/apple-icon.png`, ou `public/icon-*.png` + metadata), `package.json` (script `media:logo`), `src/components/Navbar/Navbar.jsx`, `src/components/NavbarMobile/NavbarMobile.jsx`, CSS desses componentes se preciso, `app/layout.jsx`, `src/data/metadata.js`.
1. Função pura `unpremultiplyFromBlack(r,g,b)` → `{r,g,b,a}`: `a = max(r,g,b)`; cor = `c*255/a`; `a` abaixo de um limiar baixo (~12/255) vira 0 para limpar ruído JPEG. Testar: preto→a=0, branco→branco opaco, azul `(100,150,200)`→a=200 e cor `(127.5,191.25,255)` arredondada, ruído `(8,6,5)`→a=0.
2. Função pura `recolorWhite(px, navy=[0x1F,0x34,0x60])`: pixels de baixa saturação e alta luminância (brancos) viram navy mantendo alpha; azuis/dourado intactos. Testar branco→navy, dourado `(220,210,110)` intacto, azul claro do globo `(190,225,245)` intacto (saturação suficiente) — calibrar limiar e documentar.
3. Script lê a arte-fonte com sharp raw, aplica (1) → trim do canvas transparente → exporta:
   - `public/logo-xi-gtap.webp` (largura 480px, lossless ou q≥90 com alpha)
   - `public/logo-xi-gtap-light.webp` (mesmo, com (2))
   - `public/assets/logos/xigtap.webp` (largura 600px)
   - ícone: recorte do globo (região aproximada x≈455–870, y≈0–325 da fonte; ajuste visual) quadrado com padding transparente → `app/icon.png` 512 e `app/apple-icon.png` 180 (fundo `#0b1230` no apple-icon). Remover `icons` de `app/layout.jsx` se usar convenção de arquivos do Next, ou apontar metadata para os PNGs — escolha uma e garanta que funciona com `output: 'export'`.
   - `public/og-gtap.png` 1200x630, fundo escuro da marca, logo centralizada ~70% da largura.
4. `package.json`: `"media:logo": "node scripts/generate-logo-assets.mjs"` (não acoplar ao build; saídas versionadas).
5. Navbar/NavbarMobile: `/logo.svg` → `/logo-xi-gtap.webp`, `/logo-gtap.svg` → `/logo-xi-gtap-light.webp`, `alt="XI GTAP"`, `width`/`height` reais proporcionais, altura renderizada ≈ 48px desktop (ajuste CSS para não estourar o header; logo nova é ~3.2:1, a antiga 3.1:1). Remover `loading=''`.
6. `sharedOpenGraph.images` e `app/layout.jsx` openGraph → `/og-gtap.png` com width 1200/height 630.
7. Não apagar SVGs antigos (podem ser usados em outro lugar); só deixar de referenciá-los no header.
8. Verificar visualmente as saídas (ler os PNG/WebP gerados sobre fundo escuro e claro) e rodar `npm test` + `npm run lint`.

### Task 2: Importador pic-time → fotos XI locais (R2.1–R2.3)
Arquivos: `scripts/import-pictime-gallery.mjs` (novo), `scripts/import-pictime-gallery.test.mjs` (novo), `package.json` (script `media:pictime`), saídas `public/galerias/xi-gtap/{full,thumb}/*.webp`, `public/api/galerias/xi-gtap.json`.
1. Puras + testes:
   - `parseScenes(gallery)` → `[{ sceneName, photoIds: number[] }]` usando stride 5 se `version>=3` senão 4, `photoId = minId + photos[i]`; ignora cenas vazias.
   - `orderScenes(scenes)` → "Primeiro Dia" antes de "Segundo Dia" (ordem por nome conhecido; desconhecidos no fim, ordem estável).
   - `buildEntries(orderedScenes)` → ids `dia-1-001`… (índice da cena após ordenar, contador 3 dígitos por cena) com `url`/`thumb` conforme contrato e `scene`.
   - Teste com fixture sintética pequena (version 4, 2 cenas + 1 vazia) e teste de stride 4.
2. CLI: baixa `gallery.json` (URL do spec), baixa cada `lowres/<photoId>.jpg` para `.cache/pictime/<photoId>.jpg` (pula se existe), concorrência 8, 3 retries com backoff, valida content-type image/jpeg. Gera `full` (≤1600, webp q72, `.rotate()`) e `thumb` (≤360, webp q60), grava `width/height` do full no JSON. Idempotente (pula saídas existentes, `--force` refaz).
3. Rodar o import completo (780 fotos). Conferir: 780 entradas, 442 "Primeiro Dia" + 338 "Segundo Dia", nenhum arquivo faltando, tamanho total reportado.
4. `npm test` + `npm run lint`. Commitar script, testes, JSON e as imagens (`git add public/galerias/xi-gtap public/api/galerias/xi-gtap.json scripts/import-pictime-gallery*.mjs package.json`).

### Task 3: Edição XI na galeria + álbum para 780 fotos (R2.4–R2.6)
Arquivos: `src/data/editions.js`, `src/views/galeria/GaleriaPage.jsx` (+css), `src/views/galeria/galeriaEdition/GaleriaEdition.jsx` (+css), `src/components/Slider/Slider.jsx` (+css), `scripts/verify-export.mjs`, `app/[editionText]/page.jsx` se necessário; capa nova em `public/assets/cards/xi-gtap.webp` se a capa precisar ser gerada.
1. `editions.js`: suportar logo com extensão explícita; adicionar `XI` → `{ editionText: 'XI GTAP', logo: '/assets/logos/xigtap.webp', folder: 'xi-gtap', photographer: 'Alan Gois' }`. Antigas inalteradas.
2. `GaleriaPage.jsx`: card XI (aparece primeiro, por causa do `.reverse()`); capa: inspecione o estilo das capas atuais (`https://gtap.com.br/midias/cards/gtap%20ix.webp`, baixe com curl para ver) e gere uma capa equivalente com foto 2026 (sharp, script ou parte do script da T3) em `public/assets/cards/xi-gtap.webp`; hero → "XI GTAP" e link `/XI%20GTAP/`.
3. Slider/GaleriaEdition:
   - miniaturas usam `img.thumb ?? img.url`; slides passam `width/height` quando existirem;
   - filtro por dia (botões "Todos" / "Primeiro Dia" / "Segundo Dia", só quando houver `scene`), resetando para a 1ª foto do filtro, `aria-pressed` nos botões;
   - contador "N / total" acessível (`aria-live="polite"`);
   - performance com 780: miniaturas `loading="lazy"`, slides `loading="lazy"` exceto o 1º, e evitar renderizar 780 `<img>` principais de uma vez — renderize no slide principal só uma janela (ex.: ativo ±3) mantendo placeholders do tamanho certo para o scroll-snap continuar coerente, OU outra técnica equivalente justificada no report;
   - teclado: ← → navegam quando o slider está focado;
   - crédito "Fotos: Alan Gois" quando `photographer` existir.
   - Álbuns antigos (`[{url}]`) continuam idênticos em comportamento.
4. `verify-export.mjs`: incluir `XI%20GTAP` nas rotas; a asserção `<img src="https://gtap.com.br/midias/` só para edições antigas; para XI checar `/galerias/xi-gtap/`.
5. `npm test`, `npm run lint`, `npm run build`, `npm run verify:export` (build pode precisar de rede para gtap.com.br — se `.cache` estiver vazio, rode com `allowed_domains: ["gtap.com.br"]`).

### Task 4: Fotos de evento da home → 2026 (R3)
Arquivos: `public/api/galeria.json`, `scripts/optimize-images.mjs` (+ teste existente `scripts/optimize-images.test.mjs`), `scripts/compose-home-assets.mjs` (novo), `src/assets/{image1,image-mobile,imagebg1,eventogtapforms,bannergaleria,banner-mobile-galeria,BackgroundTemas}.webp`. **Não** tocar arquivos da T3 (GaleriaPage.jsx/css, Slider, editions, verify-export).
1. Curadoria: gere folhas de contato das thumbs de `public/galerias/xi-gtap/thumb/` (no scratchpad, não no repo) e escolha fotos nítidas e variadas (palco/palestrantes, plateia cheia, networking, painel, ambos os dias). Prefira fotos sem rostos cortados.
2. `galeria.json`: 18 itens `{ id, imageUrl: "/galerias/xi-gtap/full/<id>.webp" }` (ids 0–17). Verifique a proporção que `SectionGaleria` usa e prefira fotos compatíveis.
3. `optimize-images.mjs`: aceitar `imageUrl`/`mediaUrl` locais começando com `/` lendo de `public/` (sem download), mantendo o comportamento remoto; adicionar teste.
4. `compose-home-assets.mjs`: para cada asset de R3.2, inspecione o original (dimensões, tratamento: tinta azul, colagem de 3 fotos, cartões arredondados com sombra, etc.) e regenere com fotos 2026 escolhidas, **mesmo nome e mesmas dimensões**, tratamento visual equivalente. Ids escolhidos ficam numa constante no topo do script. `BackgroundTemas.webp`: só se estiver referenciado (grep case-insensitive em `src/`); senão deixe.
5. Comparar lado a lado original vs novo (folha de contato no scratchpad) antes de concluir.
6. `npm test` + `npm run lint` + `npm run media:images` (precisa rede para gtap.com.br se cache vazio).

### Task 5: Renomear álbum 2026 para "X GTAP" (Emenda R4)
Arquivos: `git mv public/galerias/xi-gtap public/galerias/x-gtap`, `git mv public/api/galerias/xi-gtap.json public/api/galerias/x-gtap.json` (reescrever url/thumb), `scripts/import-pictime-gallery.mjs` (+test) caminhos/slug, `scripts/generate-logo-assets.mjs` (+test) gerar `public/assets/logos/xgtap.webp` sem o "I", `src/data/editions.js`, `src/views/galeria/GaleriaPage.jsx`, capa (`scripts/generate-xi-cover.mjs` → renomear para `generate-edition-cover.mjs` ou equivalente, saída `public/assets/cards/x-gtap.webp`), `scripts/verify-export.mjs`, `scripts/gallery.test.mjs` se referenciar, `public/api/galeria.json`, `scripts/compose-home-assets.mjs` (+test), `scripts/optimize-images*.mjs` se referenciar.
1. `grep -rn "xi-gtap\|XI GTAP\|XI%20GTAP\|xigtap" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out --exclude-dir=.superpowers --exclude-dir=.cache .` → zerar para o álbum (manter apenas o que é logo do header: `logo-xi-gtap*.webp`, `generate-logo-assets` arte-fonte, e textos do spec/plano).
2. Logo X: na arte-fonte (2000x627) o "I" ocupa uma coluna entre o "X" e o globo; remova a coluna do "I" (detecte pelo alpha/colunas vazias, não por coordenadas mágicas sem verificação) e desloque o bloco esquerdo ("X") para manter o gap original X→I; subtítulo inferior: manter o texto da arte (é "XI CONGRESSO…") — **recorte só a linha superior** (X + globo + GTAP) para a logo da edição, evitando o subtítulo com "XI".
3. Re-gerar capa X; hero "X GTAP".
4. `npm test`, `npm run lint`, `npm run build`, `npm run verify:export`.
