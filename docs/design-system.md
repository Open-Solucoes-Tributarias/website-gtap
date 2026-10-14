# Design System GTAP

Fonte da verdade: os tokens em `:root` de [`src/styles/global.css`](../src/styles/global.css). Este documento explica **quando** e **como** usar cada token. Se um valor não existe aqui, ele não deve aparecer no CSS: crie (e documente) um token antes.

---

## 1. Princípios

1. **Token sempre, valor literal nunca.** Cor, tamanho de fonte, espaçamento, raio, sombra e duração vêm de `var(--…)`. Exceções aceitas estão listadas explicitamente neste documento (ex.: `backdrop-filter`, alfas pontuais comentados).
2. **Uma família, poucos tamanhos.** Roboto Condensed em 8 degraus de escala. Hierarquia se faz com tamanho + peso, não com fontes novas.
3. **Ritmo de 8.** Todo espaçamento é múltiplo de 8px (4px só para ajuste fino entre ícone e rótulo).
4. **Navy e dourado são a marca.** Navy carrega texto e fundos; dourado destaca. Dourado nunca é cor de texto sobre branco.
5. **Seções iguais por padrão.** Toda seção usa `--section-py`, `--section-px` e `--stack-gap`; desvios precisam de motivo.
6. **Movimento a serviço do conteúdo.** Entradas discretas, sem esconder o LCP, e nada anima com `prefers-reduced-motion: reduce`.
7. **Acessível por padrão.** Contraste AA no texto, foco visível (anel dourado + halo navy, global) e alvos de toque de pelo menos 40px.

---

## 2. Tipografia

### Família

| Token | Valor |
|---|---|
| `--font-sans` | `var(--font-roboto-condensed), "Roboto Condensed", sans-serif` |

Roboto Condensed variável, carregada via `next/font` (variável CSS `--font-roboto-condensed`). Não importe outras famílias.

### Escala

Tamanhos fluidos com `clamp()`: o mínimo vale em ~375px e o máximo a partir de ~1280px.

| Token | Mín → máx | Line-height | Peso típico | Uso |
|---|---|---|---|---|
| `--fs-display` | 36 → 48px | `--lh-tight` | 700 | Título de destaque (hero de subpágina, 404, preço do ingresso). No máximo um por tela. |
| `--fs-h1` | 28 → 36px | `--lh-tight` | 700 | **Título de seção.** Um por seção. |
| `--fs-h2` | 22 → 26px | `--lh-tight` / `--lh-snug` | 700 | Subtítulo de seção, título de card grande, nome do ingresso. |
| `--fs-h3` | 19 → 21px | `--lh-snug` | 600–700 | Título de card, nome de palestrante, item de lista destacado. |
| `--fs-lead` | 17 → 18px | `--lh-snug` / `--lh-body` | 400–600 | Texto de abertura de seção, rótulo de botão principal, subtítulo de card. |
| `--fs-body` | 16px | `--lh-body` | 400 | Texto corrido, campos de formulário. Tamanho base do `body`. |
| `--fs-small` | 15px | `--lh-snug` | 400–500 | Legendas, metadados, selos de status, botões secundários compactos. |
| `--fs-caption` | 13px | `--lh-snug` | 400–500 | Rodapé legal, créditos. Nunca para texto que precisa ser lido com atenção. |

Regras:

- Não use tamanhos fora da escala (`18px`, `1.7rem`, `3vw` soltos). Se um bloco não couber, desça **um degrau** da escala no breakpoint (ex.: ingressos inativos usam `--fs-h3`/`--fs-h1` abaixo de 800px).
- Texto corrido nunca abaixo de `--fs-body` no mobile.
- Títulos longos: `text-wrap: balance`.

### Line-heights

| Token | Valor | Uso |
|---|---|---|
| `--lh-tight` | 1.1 | Display e títulos (`h1`, `h2`). |
| `--lh-snug` | 1.25 | `h3`, rótulos, botões, selos, textos de uma ou duas linhas. |
| `--lh-body` | 1.5 | Parágrafos e qualquer texto com mais de duas linhas. |

### Pesos

| Token | Valor | Uso |
|---|---|---|
| `--fw-light` | 300 | Apenas textos grandes decorativos (≥ `--fs-lead`). Evitar em fundo com imagem. |
| `--fw-regular` | 400 | Texto corrido. |
| `--fw-medium` | 500 | Rótulos, selos, botões compactos, links de navegação. |
| `--fw-semibold` | 600 | Botões principais, links de destaque, `h3`. |
| `--fw-bold` | 700 | Display, títulos de seção e de card, preços. `<b>`/`<strong>` em texto corrido. |

### Caixa alta

- Só em textos curtos (≤ 4 palavras): nomes de ingresso, selos, sobretítulos.
- Sempre com `letter-spacing: var(--ls-caps)` (0.04em).
- Espaçamento entre letras: corpo `--ls-body` (-0.01em, aplicado no `body`); títulos h1–h6 `--ls-tight` (-0.02em). Caixa alta é a exceção (`--ls-caps`).
- Nunca em parágrafos nem em títulos de seção inteiros.

---

## 3. Espaçamento

### Tokens (base 8)

| Token | Valor | Uso típico |
|---|---|---|
| `--space-0-5` | 4px | **Só** ajuste fino: ícone ↔ rótulo, padding vertical de link sublinhado. |
| `--space-1` | 8px | Gap entre ícone e texto, entre selo e título, padding vertical de botão compacto. |
| `--space-2` | 16px | Padding de botão, gap em grids densos, gutter mobile. |
| `--space-3` | 24px | Padding interno de card, gap padrão de grid, gutter desktop. |
| `--space-4` | 32px | `--stack-gap` desktop; separação entre blocos dentro da seção. |
| `--space-5` | 40px | Altura mínima de alvo de toque; respiros médios. |
| `--space-6` | 48px | Separação entre grupos grandes dentro de uma seção. |
| `--space-8` | 64px | `--section-py` mobile. |
| `--space-10` | 80px | Respiro de páginas isoladas (404). |
| `--space-12` | 96px | `--section-py` desktop. |
| `--space-16` | 128px | Recuos excepcionais (vídeo em destaque). Raro. |

Margens, paddings, `gap`, `inset` e offsets usam esses tokens. Valores negativos: `calc(var(--space-n) * -1)`.

### Layout de seção

| Token | Desktop | Mobile (≤ 768px) | Função |
|---|---|---|---|
| `--container` | 1200px | 1200px | Largura máxima do conteúdo. |
| `--gutter` | 24px (`--space-3`) | 16px (`--space-2`) | Margem lateral mínima. |
| `--section-py` | 96px (`--space-12`) | 64px (`--space-8`) | Padding vertical de toda seção. |
| `--section-px` | `max(--gutter, (100% − 1200px) / 2)` | idem | Padding horizontal que centraliza o conteúdo em 1200px sem wrapper extra. |
| `--stack-gap` | 32px (`--space-4`) | 24px (`--space-3`) | Distância entre o título da seção e o conteúdo. |
| `--header-h` | 104px | `max(98px, 15vw + 20px)` | Altura do header flutuante; usado em `scroll-padding-top`. |
| `--float-gap` | 16px | 8px | Distância dos elementos flutuantes (header, barra de inscrição) até a borda. |

Padrão de seção:

```css
.minha-secao {
  padding-block: var(--section-py);
  padding-inline: var(--section-px);
}

.minha-secao__titulo {
  margin: 0 0 var(--stack-gap);
}
```

- Seções vizinhas com o **mesmo fundo** não somam padding: a primeira usa `padding-bottom: 0` e a seguinte mantém o seu `--section-py` (ex.: Atuação → Temas). Blocos internos separados por um respiro de seção usam `margin-top: var(--section-py)`.
- Hero e banners de tela cheia são exceção ao `--section-py` (altura definida pela mídia), mas mantêm `--section-px`.

---

## 4. Grid e breakpoints

| Breakpoint | Regra | O que muda |
|---|---|---|
| **≤ 768px** | `@media (max-width: 768px)` | **Breakpoint principal mobile.** Tokens de layout (`--gutter`, `--section-py`, `--stack-gap`, `--float-gap`, `--header-h`) trocam aqui; navbar vira menu mobile. |
| ≤ 900px | `@media (max-width: 900px)` | Layouts em duas colunas com mídia lateral (formulário) passam a uma coluna. |
| hover | `@media (hover: hover) and (pointer: fine)` | Todo `:hover` fica dentro desta query (sem hover "grudado" no toque). |

Breakpoints adicionais (720/800px nos ingressos, faixas da galeria) são ajustes locais de grid; não crie novos sem necessidade. Prefira `grid-template-columns: repeat(auto-fit, minmax(…, 1fr))` a breakpoints extras.

Gaps de grid: `--space-3` padrão, `--space-2` em grids densos ou no mobile.

---

## 5. Cores

### Marca

| Token | Hex | Uso | Contraste / restrições |
|---|---|---|---|
| `--color-navy-900` | `#02093a` | Azul principal: fundos escuros, texto em fundo claro, botão primário. | 19.0:1 com branco. |
| `--color-navy-800` | `#0a1560` | Hover do botão navy. | 16.3:1 com branco. |
| `--color-navy-700` | `#000d74` | Fim do `--gradient-navy`. | 16.0:1 com branco. Não usar sozinho como fundo de seção. |
| `--color-blue-500` | `#1d2f9e` | Hover/foco de links em fundo claro, estado ativo. | 10.8:1 com branco. |
| `--color-sky-300` | `#83bce7` | Hover de links em fundo escuro. | 9.4:1 com navy-900. **Nunca** em fundo claro. |
| `--color-gold-500` | `#dda92e` | Dourado principal: destaques, filetes, títulos de seção em fundo escuro, anel de foco. | 8.9:1 com navy-900. **2.2:1 com branco: nunca texto em fundo claro.** |
| `--color-gold-300` | `#f2c453` | Paradas de degradê dourado. | 11.6:1 com navy-900. Não usar em fundo claro. |
| `--color-gold-200` | `#ffdf92` | Texto de destaque em fundo escuro; fim do `--gradient-gold`. | 14.7:1 com navy-900. Não usar em fundo claro. |

### Neutras

| Token | Hex | Uso | Contraste / restrições |
|---|---|---|---|
| `--color-white` | `#ffffff` | Fundo padrão da página, texto em fundo escuro. | — |
| `--color-gray-100` | `#f0f1f4` | Superfícies claras alternadas (seções, cards). | Navy-900 sobre ela: 16.9:1. |
| `--color-gray-300` | `#d3d3d3` | Bordas e divisores em fundo claro. | Não usar como texto em branco. |
| `--color-gray-500` | `#6b7080` | Texto secundário em fundo claro. | 4.9:1 com branco (AA). Em `--color-gray-100` cai para 4.4:1: só texto ≥ 18px ou bold. |
| `--color-black` | `#000000` | Apenas máscaras e sombras. | Não usar como cor de texto (use navy-900). |

### Texto (semânticos — prefira estes)

| Token | Valor | Onde |
|---|---|---|
| `--text-on-light` | navy-900 | Texto em branco / gray-100 / dourado. |
| `--text-on-light-muted` | gray-500 | Texto secundário em fundo claro. |
| `--text-on-dark` | branco | Texto em navy / degradê navy / imagem com scrim. |
| `--text-on-dark-muted` | branco 72% | Texto secundário em fundo escuro (~9.9:1 sobre navy-900). |

Regra: componentes usam os tokens `--text-*`; os tokens de paleta (`--color-*`) ficam para fundos, bordas e destaques.

### Feedback

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#0f4a29` | Mensagem de sucesso (formulário). 10.3:1 com branco. |
| `--color-error` | `#7f1710` | Erro de validação/envio. 10.3:1 com branco. |

Feedback nunca depende só da cor: acompanhe com ícone ou texto.

### Aliases legados

`--color-navy`, `--color-gold` e `--color-gold-light` apontam para navy-900, gold-500 e gold-200. Existem só por compatibilidade; **não use em código novo**.

### Alfas sem token

Transparências pontuais (`rgb(255 255 255 / 12%)` em divisores sobre navy, `rgb(2 9 58 / 15%)` em trilhos, brilho dourado `rgb(221 169 46 / 55%)`) são aceitas desde que derivem de uma cor da paleta e tenham comentário indicando a origem.

---

## 6. Degradês

| Token | Definição | Onde usar |
|---|---|---|
| `--gradient-gold` | 90°, gold-500 → gold-200 | Botões dourados (CTA da barra de inscrição, "Sugerir tema", Instagram). Texto em `--text-on-light`. |
| `--gradient-gold-rich` | 135°, cinco paradas douradas | Superfície premium: ingresso do lote atual. Um uso por tela. |
| `--gradient-navy` | 90°, navy-900 → navy-700 | Fundo de seções escuras (ingressos, formulário). Texto em `--text-on-dark`. |
| `--gradient-scrim` | De baixo para cima, navy 60% → 0% | Sobre fotos com texto/legenda por cima, para garantir contraste. |
| `--gradient-fade-x` | Máscara horizontal transparente nas bordas | `mask-image` de faixas com rolagem/marquee (sempre com `-webkit-mask-image` junto). |

Não crie degradês inline. O único efeito liberado é a faixa de brilho do CTA (`linear-gradient(100deg, transparent, branco 55%, transparent)`), que é animação, não superfície.

---

## 7. Raios e sombras

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 8px | Botões retangulares, inputs, miniaturas. |
| `--radius-md` | 16px | Cards, imagens de conteúdo, modais. |
| `--radius-lg` | 24px | Superfícies grandes: ingresso, blocos de destaque. |
| `--radius-pill` | 999px | Botões-pílula, selos, filetes e sublinhados. |
| `--glass-radius` | 16px | Elementos de vidro (ver §8). |

| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 8px 16px -8px` navy 25% | Cards em repouso, botões em hover. |
| `--shadow-md` | `0 16px 32px -16px` navy 35% | Cards em hover, modais. |
| `--shadow-lg` | `0 24px 48px -24px` preto 50% | Elementos sobre fotos/fundo escuro. |

Raios aninhados: o filho usa `border-radius: inherit` ou um degrau menor que o pai.

---

## 8. Vidro (glass)

Usado **apenas** nos elementos flutuantes: header (`Navbar`), barra de inscrição (`CardButton`) e menu mobile (`NavbarMobile`).

| Token | Função |
|---|---|
| `--glass-bg` | Reflexo branco em degradê sobre navy 30%. |
| `--glass-shadow` | Sombra projetada (sem borda nem filete). |
| `--glass-radius` | 16px. |
| `--float-gap` | Distância até a borda da tela. |

```css
.flutuante {
  background: var(--glass-bg);
  backdrop-filter: blur(22px) saturate(160%);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
}
```

Regras obrigatórias:

- **`backdrop-filter` sempre literal** (`blur(22px) saturate(160%)`), nunca via variável.
- **Nunca declare `-webkit-backdrop-filter`.** O pipeline de CSS do Next gera o prefixo; declarar os dois faz a versão padrão ser descartada e o Chrome fica sem blur.
- Não coloque `backdrop-filter`, `opacity < 1`, `filter` ou animação de entrada (`data-enter`/`data-reveal`) num **ancestral** do vidro: isso cria um contexto que desliga o desfoque. Por isso o vidro do header fica num pseudo-elemento e o `data-enter` do CTA da galeria fica no próprio CTA.
- O menu mobile usa uma variante mais opaca do `--glass-bg` (comentada no arquivo) para legibilidade.

---

## 9. Movimento

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `--dur-fast` | 160ms | Feedback de toque (`:active`), pequenos deslocamentos. |
| `--dur-ui` | 240ms | Hover de cor/fundo, abertura de menus. |
| `--dur-reveal` | 700ms | Entradas por rolagem. |
| `--reveal-stagger` | 70ms | Atraso entre irmãos em sequência. |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Padrão para tudo que entra ou responde. |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Movimentos de ida e volta (carrossel, troca de estado). |

Microinterações padrão: hover sobe `translateY(-2px)` (cards até `-6px`), `:active` aplica `scale(0.97–0.98)` com 120ms, sublinhados deslizam com `scaleX` em 360ms. Anime só `transform`, `opacity`, `translate`/`scale` e cores; nunca `width`, `height`, `top`/`left` ou `box-shadow` em loop (anime a `opacity` de um pseudo-elemento com a sombra).

### Entrada por rolagem: `data-reveal`

Runtime em `src/motion/reveal.js`, montado por `MotionRuntime`. Conteúdo é **visível por padrão**; só o que está abaixo da dobra após a hidratação recebe `data-reveal-state="pending"` e anima ao entrar na tela. Sem JS, na impressão ou com movimento reduzido nada fica escondido.

| Valor | Efeito | Quando |
|---|---|---|
| `data-reveal` | Sobe 24px + fade | Padrão: títulos, parágrafos, cards. |
| `="fade"` | Só fade | Imagens grandes, fundos. |
| `="scale"` | Sobe 12px + escala 0.94 | Cards de galeria, blocos compactos. |
| `="left"` / `="right"` | Entra 32px pela lateral | Colunas de layouts em duas colunas. |
| `="pop"` | Escala 0.6 com overshoot | Ícones, números, selos. Pouco. |
| `="line"` | `scaleX` 0 → 1 a partir da esquerda | Filetes e divisores. |

Sequência: `data-reveal-stagger` no pai atribui `--i` aos filhos (até 8 passos de 70ms). Também é possível definir `--i` no CSS do componente; não use estilo inline.

### Entrada no primeiro paint: `data-enter`

CSS puro, sem JS, para o topo das subpáginas (galeria, edição, 404). Parte de `opacity: 0.6` (nunca 0, porque o texto pode ser o LCP), sobe 14px, 560ms, com `--i` × 90ms de atraso (até 6). `data-enter="line"` desenha filetes.

### Regras de LCP

- **Não anime o hero da landing nem o `CardButton`** (barra de inscrição): são acima da dobra e candidatos a LCP.
- Nada acima da dobra começa com `opacity: 0`.
- Imagem principal do topo nunca leva `data-reveal`.

### Movimento reduzido

`@media (prefers-reduced-motion: reduce)` zera durações e atrasos globalmente. Rolagem suave (nativa ou Lenis, só desktop) e View Transitions só existem em `no-preference`. Qualquer animação nova deve ficar dentro de `@media (prefers-reduced-motion: no-preference)` ou ser neutralizada pela regra global.

---

## 10. Componentes-padrão

| Componente | Especificação | Onde vive |
|---|---|---|
| **Título de seção** | `--fs-h1`, `--fw-bold`, `--lh-tight`, `margin: 0 0 var(--stack-gap)`, centralizado. Em fundo claro `--text-on-light`; em fundo escuro `--text-on-dark` ou `--color-gold-500`. `data-reveal`. | `.tickets__title` (`SectionInvestimento.css`) é a referência; demais seções em `src/views/landingPage/Sections/*`. |
| **Botão primário (navy)** | Fundo `--color-navy-900`, texto `--text-on-dark`, `--fs-lead` `--fw-semibold` `--lh-snug`, padding `--space-2`, `--radius-pill`. Hover: `--color-navy-800` + `translateY(-2px)`; active `scale(0.98)`. Em fundo dourado, foco com `outline-color: navy-900`. | `.ticket__btn` em `SectionInvestimento.css`. |
| **Botão dourado** | Fundo `--gradient-gold`, texto `--text-on-light`, `--fw-medium`/`--fw-semibold`, padding `--space-1` × `--space-2/3`, `--radius-sm`, altura mínima `--space-5`. Hover com faixa de brilho e sombra dourada no pseudo-elemento. | `.card-button-cta` (`CardButton.css`), `.sugerir-tema-btn` (`SectionTemas.css`), botões Instagram (`SectionIdealizador.css`). |
| **Link-pílula** | Contorno `1px` branco 28% em fundo escuro, `--radius-pill`, padding `--space-1` × `--space-3`, `--fs-lead`, gap `--space-2` com ícone. Hover: fundo branco 10%. | `.ticket-group` em `SectionInvestimento.css`. |
| **Link de texto** | `--fw-semibold`, sublinhado de 2px que desliza (`::after` com `scaleX`, 360ms). Hover: `--color-blue-500` em fundo claro, `--color-sky-300` em fundo escuro. | `.not-found-link` (`global.css`), `.navbar-links a` (`Navbar.css`). |
| **Card** | Padding `--space-3`, `--radius-md`, fundo branco/gray-100 (claro) ou branco 7% (escuro), `--shadow-sm` → `--shadow-md` no hover, título `--fs-h3`, texto `--fs-body`. `data-reveal="scale"` com `data-reveal-stagger` no grid. | `.card-tema` (`SectionTemas.css`), `.card-publico`, `.card-palestrantes`, `.depoimento-card`, `.card-gtap` (`GaleriaPage.css`). |
| **Ingresso** | `--radius-lg`, padding `--space-3` (`--space-2` ≤ 800px), recortes por `mask`. Atual: `--gradient-gold-rich` + texto navy, selo pílula navy, sobe 6px no hover. Inativo: branco 7% + texto branco 62%. Nome `--fs-h2` caixa alta; preço `--fs-display`. | `.ticket`, `.ticket--current`, `.ticket--inactive` em `SectionInvestimento.css`. |
| **Vidro flutuante** | Ver §8. | `Navbar.css`, `CardButton.css`, `NavbarMobile.css`. |

---

## 11. Checklist para novas seções

- [ ] `padding-block: var(--section-py)` e `padding-inline: var(--section-px)`; conteúdo limitado a `--container`.
- [ ] Título com o padrão de título de seção (`--fs-h1`, bold, tight, `margin-bottom: var(--stack-gap)`).
- [ ] Todo `font-size` é um token `--fs-*`; todo `font-weight`, `--fw-*`; todo `line-height`, `--lh-*`.
- [ ] Todo espaçamento é `--space-*` (múltiplo de 8; 4px só em ajuste fino).
- [ ] Cores via `--text-*` para texto e `--color-*`/`--gradient-*` para fundos; nenhum hex solto, nenhum alias legado.
- [ ] Contraste AA conferido (dourado nunca como texto em fundo claro; `sky-300` só em fundo escuro).
- [ ] Raios e sombras por token.
- [ ] Mobile ajustado em `@media (max-width: 768px)`; `:hover` dentro de `(hover: hover) and (pointer: fine)`.
- [ ] Entradas com `data-reveal`/`data-reveal-stagger` (abaixo da dobra) ou `data-enter` (topo de subpágina); nada acima da dobra parte de `opacity: 0`.
- [ ] Animações só com `transform`/`opacity`, durações e easings por token, respeitando `prefers-reduced-motion`.
- [ ] Vidro: `backdrop-filter` literal, sem `-webkit-`, sem ancestral com filtro/opacidade/animação.
- [ ] Alvos clicáveis ≥ 40px (`--space-5`) e foco visível (o anel global já cobre; não remova `outline`).

## Botões

Padrão único, baseado no CTA "Garanta a sua vaga" da barra de inscrição. Classes globais em `src/styles/global.css`:

| Classe | Uso |
| --- | --- |
| `.btn` | Base: `--fs-h3` (desktop) / `--fs-lead` (≤768px), peso regular, padding `--space-1` × `--space-3`, altura mínima `--space-6`, `--radius-sm`. Hover sobe 2px com sombra; clique `scale(.98)`; ícone desliza 2px. |
| `.btn--gold` | Ação principal (fundo `--gradient-gold`, texto preto). |
| `.btn--navy` | Ação principal sobre superfícies douradas (formulário, ingresso atual). |
| `.btn--ghost` | Ação secundária em fundo escuro (contorno branco 40%). |

Regras: texto em caixa normal (sem caixa alta); componentes só ajustam layout (largura, margens), nunca fonte, raio, padding ou cores do botão; botões só com ícone (setas, fechar, miniaturas) ficam fora deste padrão.
