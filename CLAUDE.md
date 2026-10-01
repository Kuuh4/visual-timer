# CLAUDE.md — Mellow Visual Timer

Contexto para sessões do Claude Code neste repositório. Há arquivos `CLAUDE.md` mais específicos em `src/` (frontend) e `workers/timer-notifications/` (backend de push) — leia o do diretório em que for mexer.

## O que é o projeto

PWA de timer visual (React + TypeScript + Vite) publicado em GitHub Pages sob o caminho `/visual-timer/`. Três modos de timer: **base timer** (arrastar/clicar no mostrador), **basic timers** salvos em lista e **routine timer** (sequência de basic timers, para Pomodoro e similares). Tem estatísticas de foco, temas customizáveis, wake lock de tela e alertas em background via Web Push.

O `README.md` descreve as features do ponto de vista do usuário e o `CHANGELOG.md` o histórico de releases — consulte-os antes de supor comportamento de produto. O `DEVLOG.md` guarda o racional das decisões de desenvolvimento (motivação, alternativas descartadas, pontos em aberto): leia a entrada relevante antes de refazer uma decisão e acrescente uma entrada nova ao concluir uma mudança significativa, deixando o `CHANGELOG.md` apenas com o registro direto.

## Comandos

| Ação                    | Comando                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| Dev server (porta 3000) | `npm run dev`                                                               |
| Build de produção       | `npm run build` (roda `tsc`, `vite build` e `scripts/strip-sourcemaps.mjs`) |
| Preview do build        | `npm run preview`                                                           |
| Testes                  | `npm test` (Jest + jsdom, `--runInBand`)                                    |
| Formatação              | `npm run format` (Prettier)                                                 |

Não existe script de lint no `package.json`, mas há configuração de ESLint em `.eslintrc.json`. O hook de pre-commit (`.husky/pre-commit`) roda `lint-staged`, que aplica Prettier nos arquivos staged.

## Convenções de código

- Prettier é a fonte da verdade de formatação: 4 espaços, aspas simples, ponto e vírgula, `printWidth` 120, plugin `prettier-plugin-tailwindcss`. Não brigue com ele — escreva e deixe o Prettier ajustar.
- TypeScript estrito; estilização exclusivamente por classes Tailwind (ver `tailwind.config.js`), sem CSS novo fora de `src/index.css`.
- O código e os comentários do repositório estão em inglês (com alguns comentários em coreano herdados do upstream). Mantenha novos comentários e identificadores em inglês, mesmo que a conversa seja em português.
- Nada de `console.log` em código de produção; os caminhos de notificação usam `console.debug` deliberadamente para falhas não fatais.

## Layout do repositório

- `src/` — aplicação React. Ver `src/CLAUDE.md`.
- `workers/timer-notifications/` — Cloudflare Worker + Durable Object que entrega as notificações de fim de timer. Ver `workers/timer-notifications/CLAUDE.md`.
- `public/` — assets estáticos servidos como estão (áudios de alarme, ícones, `manifest.json`).
- `scripts/strip-sourcemaps.mjs` — remove sourcemaps residuais do `dist/` depois do build, para que não vazem para o GitHub Pages.
- `docs/superpowers/` — planos e especificações de design de features (hoje, o de notificações confiáveis em background). É documentação histórica de decisão: leia antes de alterar a arquitetura de notificações.
- `meta/esqueleto/` — esqueleto de pastas do sistema pessoal de organização de arquivos do usuário, fora do versionamento (ignorado em `.git/info/exclude`). Não faz parte do app.
- `.kilo/worktrees/` — worktrees git de outra ferramenta. **Nunca edite arquivos ali**; são cópias de trabalho separadas.

## Configuração e ambiente

`.env` (modelo em `.env.example`) com duas variáveis lidas pelo Vite:

- `VITE_TIMER_NOTIFICATION_API_URL` — base URL do Worker de notificações. Sem ela, os alertas em background simplesmente não são agendados (as funções retornam cedo em vez de falhar).
- `VITE_SENTRY_DSN` — Sentry no cliente; opcional em desenvolvimento.

Sourcemaps só são gerados e enviados ao Sentry quando `SENTRY_AUTH_TOKEN` existe, o que na prática só acontece no CI.

## Deploy

`.github/workflows/deploy.yml` faz build e publica `dist/` no GitHub Pages a cada push em `main` que toque `public/`, `src/`, `index.html`, `vite.config.ts` ou `package.json`. O Worker **não** é deployado por esse workflow — ele vai separadamente via `wrangler`.

## Cuidados

- `base: '/visual-timer/'` no Vite e o `scope`/`start_url` do manifest PWA dependem desse caminho. Links internos e deep links precisam considerá-lo.
- O service worker é construído com `strategies: 'injectManifest'` a partir de `src/service-worker.ts` — ou seja, ele é código do projeto, não gerado. Alterações nele afetam cache offline e recebimento de push ao mesmo tempo.
- Este repositório é um fork de `do0ori/visual-timer`. O alvo de publicação é `https://kuuh4.github.io/visual-timer` (remoto `github`, `Kuuh4/visual-timer`), e o remoto `origin` é o Forgejo privado (`kuuh/visual.timer`) — o nome com ponto vale só do lado privado, porque é o nome do repositório no GitHub que forma o caminho `/visual-timer/` do Pages. As URLs do README, as metatags de `index.html` e o link de feedback ainda apontam para o upstream.
- O Worker de notificações libera `https://kuuh4.github.io` por CORS, mas isso só vale depois de um `wrangler deploy` — o Worker em produção hoje é o do upstream, e usá-lo exigiria que ele tivesse essa origem. Para alertas em background próprios é preciso deployar este Worker com chaves VAPID próprias e apontar `VITE_TIMER_NOTIFICATION_API_URL` para ele.
