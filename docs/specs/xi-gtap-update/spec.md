# Spec — XI GTAP (2026): nova logo, galeria 2026 e fotos da home

## Objetivo
1. Trocar a logo do site pela logo "XI GTAP" (arte fornecida: JPG 2000x627, fundo preto).
2. Criar a galeria da edição XI GTAP (2026) com **todas as 780 fotos** da pic-time
   (`https://alangois.pic-time.com/-gtap-2026/gallery`), hospedadas **localmente** no repo.
3. Trocar **toda foto de evento** exibida na home (e nos banners da galeria) por fotos de 2026.

## Fatos levantados
- Fonte pic-time: `gallery.json.txt` em
  `https://pictime7eus1public-pub-hdf3hecqdpaqeuev.a02.azurefd.net/pictures/54/44/54044754/332r2e3vmx6d5kh0tl/gallery.json.txt`
  - `version: 4` → `scenes[].photos` é um array plano em blocos de 5; o 1º valor do bloco é o offset do id.
    `photoId = minId + photos[i*5]` (versão < 3 usaria blocos de 4).
  - Cenas: "Primeiro Dia" (442), "Segundo Dia" (338), "Highlights" (0, ignorar).
  - Imagem: `<base>/lowres/<photoId>.jpg` → 1600px no lado maior, ~380KB, com marca d'água discreta
    "alangois.com" (crédito do fotógrafo; manter). `thumbres` = 100px (inútil). `hires` = 404.
- Site: Next 16 `output: 'export'`, `trailingSlash: true`, sem next/image; imagens via
  `src/components/ResponsiveImage`. Pipeline `scripts/optimize-images.mjs` gera srcsets (gitignored).
- Edições: `src/data/editions.js` (I…IX), fotos em `public/api/galerias/<folder>.json` (`[{url}]`),
  capas hardcoded em `src/views/galeria/GaleriaPage.jsx`, rotas checadas em `scripts/verify-export.mjs`.
- Testes: `node --test scripts/*.test.mjs`. Lint: `eslint .`. Build: `npm run build` → `out/`.

## Requisitos

### R1 Logo
- R1.1 Gerar a partir do JPG uma versão com **fundo transparente** preservando as cores (branco, azuis do globo, dourado do "A"), sem halo/serrilhado preto visível sobre fundo escuro.
- R1.2 Versão para header claro (`Navbar lightTemplate`, página Open): partes brancas viram azul-marinho `#1F3460`; azuis e dourado mantidos.
- R1.3 Navbar desktop e mobile usam a nova logo, com `width`/`height` explícitos (sem CLS) e `alt="XI GTAP"`; tamanho visual equivalente ao atual no header (altura ≈ 48px desktop) sem quebrar layout mobile.
- R1.4 Favicon: recorte do globo da nova logo (PNG 512 + 32/16 ou `app/icon.png`), e `apple-touch-icon` 180.
- R1.5 OG image: PNG 1200x630 com a logo centralizada sobre fundo escuro da marca; `sharedOpenGraph` e `app/layout.jsx` passam a usá-la (o check `og:image` do verify-export continua passando).
- R1.6 Logo da edição XI para a página de álbum: `public/assets/logos/xigtap.webp` (transparente).
- R1.7 Geração reprodutível via script versionado; arte-fonte versionada fora de `src/assets` (para não entrar no pipeline de otimização).

### R2 Galeria XI GTAP (2026)
- R2.1 Script versionado importa da pic-time: lê `gallery.json`, baixa as 780 `lowres` (cache em `.cache/pictime`, concorrência limitada, retries), gera WebP:
  - `public/galerias/xi-gtap/full/<id>.webp` — lado maior ≤ 1600px, qualidade ~72
  - `public/galerias/xi-gtap/thumb/<id>.webp` — lado maior ≤ 360px, qualidade ~60
  - `<id>` = `dia-1-001`… (Primeiro Dia) e `dia-2-001`… (Segundo Dia), na ordem do fotógrafo.
- R2.2 Gera `public/api/galerias/xi-gtap.json`: `[{ id, url, thumb, width, height, scene }]`, Primeiro Dia antes do Segundo; `scene` = "Primeiro Dia" | "Segundo Dia".
- R2.3 Funções puras (parse do gallery.json, nomes, ordenação) com testes `node --test`.
- R2.4 Edição "XI GTAP" em `editions.js` (logo `/assets/logos/xigtap.webp`, folder `xi-gtap`), rota `/XI%20GTAP/` gerada, no sitemap e no verify-export. Edições antigas inalteradas (ainda `.svg`).
- R2.5 Página `/galeria/`: card da XI GTAP primeiro (mais recente) e hero/banner apontando para XI GTAP.
- R2.6 Página do álbum suporta 780 fotos sem travar: miniaturas usam `thumb`; `width/height` nas imagens; lazy loading; filtro por dia ("Todos", "Primeiro Dia", "Segundo Dia") quando houver `scene`; contador "N / total"; crédito "Fotos: Alan Gois" para a XI. Álbuns antigos (só `url`) continuam funcionando como hoje.

### R3 Fotos de evento da home → 2026
- R3.1 `public/api/galeria.json` (carrossel da home, 18 itens) passa a usar 18 fotos de 2026 (locais, curadoria variada: palco, plateia, networking, ambos os dias), com srcset gerado pelo pipeline (`optimize-images.mjs` aceita caminhos locais `/galerias/...`).
- R3.2 Assets de foto de evento em `src/assets/` substituídos por fotos de 2026, **mantendo nome de arquivo, dimensões e tratamento visual** (tinta azul, colagem, cantos arredondados etc.): `image1.webp`, `image-mobile.webp`, `imagebg1.webp`, `eventogtapforms.webp`, `bannergaleria.webp`, `banner-mobile-galeria.webp`, `BackgroundTemas.webp` (se em uso). Não mexer em: `alexandre.webp` (retrato), fotos de Salvador/farol/oceano, fundos só-padrão, `background2.webp` (não usado), poster do vídeo.
- R3.3 Composições geradas por script versionado (reprodutível a partir dos ids escolhidos).

## Fora de escopo
- Edição "X GTAP" (já ausente no site hoje).
- Vídeo do banner e depoimentos.

## Critérios de aceite
- `npm test`, `npm run lint`, `npm run build`, `npm run verify:export` passam.
- Verificação no browser (preview de `out/`): header com nova logo (escuro e claro), favicon, `/galeria/` com XI, `/XI%20GTAP/` navegável com filtro por dia, home com fotos 2026, mobile 375px sem overflow, sem erros no console.

## Emenda (decisão do usuário, 2026-10-13)
As fotos de 2026 mostram "X GTAP" (crachás/painéis): o evento de 2026 é a **X edição**. A logo XI fornecida é da próxima edição e fica **só no header/favicon/OG** (R1 inalterado).
- R4.1 O álbum de 2026 passa a ser **"X GTAP"**: `editionText: 'X GTAP'`, rota `/X%20GTAP/`, folder `x-gtap`. Nenhuma referência a "XI GTAP"/`xi-gtap` deve restar para o álbum (dados, pastas, capa, hero, verify-export, sitemap, testes, scripts).
- R4.2 Fotos movidas para `public/galerias/x-gtap/{full,thumb}/` e dados para `public/api/galerias/x-gtap.json` (mesmo formato); importador e composição da home apontam para o novo caminho; `galeria.json` da home idem.
- R4.3 Logo da edição X: `public/assets/logos/xgtap.webp`, derivada da arte XI removendo o "I" e reaproximando "X" e o globo (mesmo espaçamento visual que havia entre "I" e o globo), gerada pelo script de logo. `xigtap.webp` deixa de ser usado pelo álbum (pode ser removido).
- R4.4 Capa do card em `/galeria/` e hero com "X GTAP".
