# AGENTS.md — fluxo de desenvolvimento e deploy (gtap.com.br)

Leia este arquivo antes de alterar código, branches, `.htaccess`, `.gitignore` ou qualquer coisa de publicação. Vale para qualquer agente/LLM (Claude Code, Codex, Cursor etc.). Idioma do projeto e das respostas: português do Brasil.

## Resumo em 10 linhas

- Site Next.js com **exportação estática** (`output: 'export'`, `trailingSlash: true`). O que vai ao ar é a pasta `out/`, nunca o código-fonte.
- Repositório: `Open-Solucoes-Tributarias/website-gtap` (GitHub). Domínio de produção: `https://gtap.com.br` (Hostinger, hospedagem compartilhada com Apache/LiteSpeed).
- Três branches com papéis fixos: `dev` (trabalho) → `main` (fonte aprovada) → `hostinger` (só o build, gerada por robô).
- Fluxo: commit em `dev` → push `dev` → merge `dev` em `main` → push `main` → o GitHub Actions faz o build e atualiza a branch `hostinger` → a Hostinger (Git do hPanel) puxa a `hostinger` para a raiz de `public_html`.
- **Nunca** edite, commite ou faça push direto na branch `hostinger`. Ela é sobrescrita a cada build.
- **Não existe FTP/SFTP/rsync** neste fluxo. Não proponha nem adicione secrets de FTP.
- Pastas que pertencem ao servidor e **nunca** podem ser versionadas, geradas em `out/` nem apagadas: `midias/`, `sorteio/`, além de PHP, banco e qualquer outra coisa fora do export.
- Nenhum script npm publica. A publicação é só o workflow + o Git da Hostinger.
- Antes de dar algo por pronto: `npm run lint`, `npm run build`, `npm run verify:export`.
- Não faça push/merge sem o usuário pedir; quando pedir "push para dev e merge na main", é exatamente o fluxo acima.

## Fluxo de deploy (fonte da verdade)

```
dev ──merge──▶ main ──push──▶ GitHub Actions ──publica out/──▶ branch hostinger ──Git da Hostinger──▶ public_html/
(código)       (código)      .github/workflows/                (só arquivos do site,                   (raiz do domínio)
                             deploy-hostinger.yml               .htaccess na raiz)
```

1. Desenvolva e commite em `dev`. Push: `git push origin dev`.
2. Para publicar: `git checkout main && git merge --no-ff dev && git push origin main` (volte para `dev` depois).
3. O workflow [`.github/workflows/deploy-hostinger.yml`](.github/workflows/deploy-hostinger.yml) dispara no push da `main` (ou manualmente, *workflow_dispatch*). Ele roda `npm ci`, `npm run lint`, `npm run build`, `npm run verify:export`, confere que `out/` tem `.htaccess` e `index.html` e que **não** contém `midias` nem `sorteio`, e publica o conteúdo de `out/` na branch `hostinger` (`peaceiris/actions-gh-pages`, `GITHUB_TOKEN`, sem secrets extras).
4. A Hostinger (hPanel → Avançado → Git, domínio gtap.com.br) deve estar configurada com o repositório acima, **branch `hostinger`**, pasta de instalação = raiz de `public_html`. Com o webhook de auto-deploy no GitHub (evento *push*), a publicação é automática; sem ele, clique em *Deploy* no hPanel.
5. Se o workflow falhar, nada é publicado e o site em produção continua como estava.

### Por que a branch `hostinger` existe

A `main` tem o código-fonte; o site pronto só existe depois do build. Se a Hostinger puxar a `main`, o `public_html` recebe arquivos que não são o site. Por isso o build é publicado numa branch separada e a Hostinger aponta para ela. O log de deploy da Hostinger mostra qual branch foi clonada (`Cloning ... (branch: ...)`): deve ser `hostinger`.

### Preservação de pastas do servidor

- O deploy por Git da Hostinger só preserva com certeza os caminhos que estão no `.gitignore` (log: "Preserving paths matched by .gitignore").
- Por isso `/midias/` e `/sorteio/` estão no `.gitignore` da raiz **e** em `public/.gitignore` (copiado para `out/.gitignore`, que vai para a raiz da branch `hostinger`). Mantenha os dois em sincronia. Ao descobrir outra pasta que só existe no servidor, inclua-a nos dois e no teste de colisão do workflow.
- **Não** coloque `/galeria/` no `.gitignore`: `galeria/` é uma rota do site (`out/galeria/index.html`). Protegê-la faria a Hostinger deixar de publicar a página nova. Se houver arquivos antigos do servidor dentro de `galeria/`, proteja apenas esses caminhos específicos.
- `midias/` guarda as mídias históricas usadas pelas URLs `https://gtap.com.br/midias/...` (banner em vídeo, vídeos de depoimentos, capas, originais e versões otimizadas `full`/`mid`/`thumb` de **todos** os álbuns I–X). `sorteio/` é uma aplicação estática separada ("Sorteio X GTAP 2026"). Nenhuma das duas é gerada por este projeto.
- **Teste `midias/` sempre pela origem, não pelo CDN**: o Cloudflare da Hostinger guarda cópias por semanas e mascara arquivos que já sumiram. Use um cache-buster, por exemplo `curl -s -o /dev/null -w "%{http_code}" "https://gtap.com.br/midias/...?cb=$RANDOM"` (se der 404, o arquivo não existe na origem). Em 14/10/2026 o conteúdo antigo de `midias/` estava ausente na origem sem ninguém perceber e foi restaurado a partir do backup do hPanel; mantenha um backup local de `midias/` e nunca presuma que 200 sem cache-buster significa "preservada".
- O banner do topo usa o vídeo otimizado versionado (`public/optimized-video/`, via `src/data/generated-video.json`), não o original de 122 MB em `midias/`. Os vídeos de depoimentos ainda carregam de `midias/depoimentos/`.

## O que NÃO fazer

- Não commitar `out/`, `.next/`, `node_modules/`, `.cache/` na `main`/`dev`.
- Não editar nem dar push na branch `hostinger`; não fazer force-push nela.
- Não adicionar deploy por FTP/SFTP/SSH/rsync, `dangerous-clean-slate` nem qualquer passo que apague arquivos no `public_html`.
- Não gerar `midias/` ou `sorteio/` dentro de `public/` (o workflow barra).
- Não criar fallback SPA no `.htaccess` (cada rota tem seu `index.html`; não deve haver regra geral para a home).
- Não "limpar" o `public_html` para publicar.
- Não habilitar auto-merge, não rodar deploy em produção por conta própria e não pular hooks/validações.

## `.htaccess`

- Existe em três lugares e os três **têm de ser idênticos**: `.htaccess` (raiz), `public/.htaccess` (copiado para `out/.htaccess` no build) e o que está em produção. `scripts/verify-export.mjs` compara os três arquivos do repositório e falha se divergirem.
- Ele **substitui** o `.htaccess` do servidor a cada deploy. Regras próprias do servidor (HTTPS, domínio, PHP, `sorteio`) precisam estar no arquivo do repositório, senão se perdem.
- Conteúdo atual: `DirectoryIndex index.html`, `ErrorDocument 404 /404.html`, 301 de `/open-solucoes-tributarias/` para `https://www.opensolucoestributarias.com.br/`, Deflate e políticas de cache (longo/imutável para arquivos com hash, 1 dia para mídias, `no-cache` para HTML/JSON).

## Desenvolvimento local

- Node.js 20.9+ e npm. FFmpeg só se o vídeo do banner mudar.
- `npm ci`, `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run verify:export`, `npm run preview` (serve `out/` em `http://127.0.0.1:4173`, sem Next).
- `npm run build` e `npm run dev` rodam `media:images` antes (pré-build). Toda a mídia otimizada é **versionada** (`public/optimized/`, `public/optimized-video/`, `src/data/generated-media.json`, `src/data/gallery-media.json`, `src/data/generated-video.json`, `src/styles/generated-media.css`); o build não precisa de rede nem de FFmpeg. **Fotos de álbuns não são versionadas**: ficam no servidor (veja abaixo). Se entrar mídia nova, versione os arquivos gerados.
- Dados em `public/api/*.json` e `public/api/galerias/*.json` são incorporados no build: mudar dados exige novo build e deploy.
- Álbum X GTAP (`public/api/galerias/x-gtap.json`): curadoria de 226 das 780 fotos originais, registrada em `docs/x-gtap-selecao.json` (prioridade: clientes/participantes, palestrantes, melhores fotos do local e brindes; sem duplicatas nem sequências do mesmo retrato). Não recoloque as 780 sem pedido do usuário. As fotos **não estão no repositório**: ficam no servidor em `public_html/midias/X GTAP/{full,mid,thumb}/<id>.webp` (como os álbuns antigos) e o JSON/manifesto apontam para `https://gtap.com.br/midias/X%20GTAP/...` (`src/data/xgtap.js` monta a URL das fotos da home). Foto nova: `npm run media:pictime` gera as três versões em `.cache/midias/X GTAP/` (fora do Git); envie essa pasta para `midias/` (nunca apague nada lá) antes do deploy. Para recortes da home (`scripts/compose-home-assets.mjs`) as fotos `full` são baixadas do servidor. Estão em `midias/X GTAP/full/` também `dia-2-091`, `dia-2-046` e `dia-1-307`, que não fazem parte do álbum (`dia-2-091` e `dia-1-307` são as pontas do banner da galeria, em `compose-home-assets.mjs`; `dia-2-046` hoje não é usada).
- Rotas exportadas: home, `/galeria/` e dez álbuns (`/I GTAP/` … `/X GTAP/`, URLs com espaço mantidas). Não existe rota `/XI GTAP/`.
- Formulário de contato: envio direto ao RD Station (identificador `site-gtap-xi`); não há `form-handler.php`. Meta Pixel carregado após o load.
- `npm test` pode falhar no Windows com `EPERM`/`EBUSY` em `optimize-images.test.mjs` (bloqueio de arquivo na pasta temporária). É problema do ambiente local, não do código; o workflow não roda `npm test`.
- A Vercel (`vercel.json`) é usada só como preview; produção é a Hostinger.

## Busca facial na galeria

- Plano e estado: [`docs/busca-facial.md`](docs/busca-facial.md). Tudo roda no navegador; o site continua estático. Política em `/privacidade/` (aceite obrigatório no diálogo).
- Arquivos versionados em `public/face-search/` (manifest, `lib/`, `models/`, `data/<álbum>.<hash>.bin`): **não edite à mão**. Gere com `npm run faces:assets` (só se trocar a versão da lib) e `npm run faces:index [-- <álbum>]` (retoma do cache em `.cache/faces/`; baixa as fotos de `midias/` se não houver cópia local).
- **Foto nova/removida em álbum ⇒ rodar `npm run faces:index` e versionar.** O `verify-export` falha se o índice citar foto que não existe mais.
- `.htaccess` tem regra de cache imutável para `*.<hash10>.bin` (mantenha os três idênticos). Os `.bin` e a lib têm hash no nome: nunca renomeie sem regenerar.
- Os descritores publicados são dado biométrico (LGPD): não adicionar caixas, nomes ou qualquer rótulo de pessoa ao índice.

## CI/CD em resumo

| Workflow (`.github/workflows/`) | Quando roda | O que faz |
|---|---|---|
| `ci.yml` — CI (lint, testes e build) | push em `dev` e pull requests | `npm ci`, `lint`, `test`, `build`, `verify:export` e checagem de que `out/` não tem `midias`/`sorteio`. **Não publica.** |
| `deploy-hostinger.yml` — Build para Hostinger | push na `main` (ou manual) | Mesmo build + validações e publica `out/` na branch `hostinger`; a Hostinger puxa essa branch para `public_html`. |
| `verify-production.yml` — Verificar produção | todo dia às 08:00 (Brasília) e manual | `node scripts/verify-production.mjs`: rotas, build no ar, redirect da Open e arquivos de `midias/` na origem. Falhou = o GitHub avisa por e-mail. |

Fluxo de um ajuste: trabalhar em `dev` → conferir o CI verde → merge em `main` → acompanhar o deploy → `npm run verify:prod`. Receitas:

- **Texto/layout/seção da home:** editar em `src/views`, `npm run lint && npm run build && npm run verify:export`, publicar.
- **Foto de álbum nova ou trocada:** gerar `full`/`mid`/`thumb`, **enviar para `midias/<edição> GTAP/` no servidor** (só adicionar, nunca sobrescrever ou apagar), atualizar `public/api/galerias/<edição>.json` e rodar `npm run media:images` (mede só a miniatura nova); depois publicar. Detalhes na seção do álbum X GTAP acima.
- **Recortes da home/banner da galeria:** trocar os ids em `scripts/compose-home-assets.mjs`, rodar `node scripts/compose-home-assets.mjs` e `npm run media:images`, versionar o que mudou.
- **Palestrantes exibidos:** lista `PALESTRANTES_EXIBIDOS` em `src/views/landingPage/LandingPage.jsx`. **Temas:** bloco comentado em `SectionTemas.jsx`.
- **Algo sumiu em produção:** `npm run verify:prod` aponta o arquivo; `midias/` se restaura do backup do hPanel (adicionar sem sobrescrever).
- **Rollback:** reverter o commit em `dev`, merge em `main` (ver "Recuperação").

## Checklist antes de publicar

1. `npm run lint` · `npm run build` · `npm run verify:export` passando (o CI repete isso em `dev`).
2. `.htaccess` da raiz e `public/.htaccess` idênticos; regras próprias do servidor conciliadas.
3. `out/` sem `midias`/`sorteio`; `/midias/` e `/sorteio/` no `.gitignore` e em `public/.gitignore`.
4. Merge em `main` e push; acompanhar o run do workflow (`gh run list`/`gh run watch`) até `success`.
5. Conferir que a branch `hostinger` foi atualizada e que o hPanel está na branch `hostinger`.

## Verificação pós-deploy (produção)

Preferir o script, que já usa cache-buster e confere os arquivos de `midias/` na origem (aguarde o webhook da Hostinger puxar a branch `hostinger`, cerca de 1 minuto):

```sh
npm run verify:prod
```

Manualmente (use sempre cache-buster em `midias/`):

```sh
curl -sI https://gtap.com.br/ | head -3                      # 200, last-modified recente
curl -s  https://gtap.com.br/ | grep -c "logo-xi-gtap.svg"   # build novo no ar
curl -s -o /dev/null -w "%{http_code}\n" https://gtap.com.br/galeria/
curl -s -o /dev/null -w "%{http_code}\n" -r 0-0 "https://gtap.com.br/midias/banner-gt-abertura.mp4?cb=$RANDOM"   # 206 (preservada na origem)
curl -s -o /dev/null -w "%{http_code}\n" https://gtap.com.br/sorteio/                        # 200 (preservada)
curl -sI https://gtap.com.br/open-solucoes-tributarias/ | head -3   # 301 → site da Open
curl -s -o /dev/null -w "%{http_code}\n" https://gtap.com.br/naoexiste                       # 404
```

Depois limpe o cache do host/CDN e confira no navegador (não só o status HTTP) a home, a galeria, um álbum e o sorteio.

## Recuperação

- **Hostinger recusa clonar/puxar por arquivos não rastreados** (por SSH, na raiz do `public_html`; não apaga nada):
  `git init && git remote add origin <URL> && git fetch origin hostinger && git reset --hard origin/hostinger`. O `reset --hard` só sobrescreve arquivos presentes na branch; `midias`, `sorteio` e o resto ficam.
- **Deploy trouxe código-fonte para `public_html`** (branch errada): troque a branch no hPanel para `hostinger`, faça *Deploy* e remova manualmente apenas os arquivos de código-fonte que sobraram (`app/`, `src/`, `scripts/`, `package.json` …), sem tocar em `midias`, `sorteio` ou pastas fora do projeto.
- **Rollback**: reverta o commit problemático em `dev`, faça merge em `main`; o workflow reconstrói a `hostinger`.

## Convenções de commit

Mensagens em português, estilo conventional commits (`feat:`, `fix:`, `ci(deploy):`, `chore(deploy):`). Commits feitos por agentes terminam com a linha de coautoria indicada pela ferramenta. Não use `--no-verify`.
