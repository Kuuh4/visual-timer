# CLAUDE.md — `workers/timer-notifications/`

Cloudflare Worker que entrega as notificações de fim de timer por Web Push. É um projeto separado do frontend: tem o próprio `tsconfig.json` e o próprio deploy (`wrangler`), e **não** é publicado pelo workflow de GitHub Pages. O cliente que conversa com ele é `src/services/timerNotificationService.ts`.

## Arquitetura

- `src/index.ts` — roteador HTTP e CORS. Só duas rotas: `GET /v1/push/public-key` (devolve a chave VAPID pública) e `PUT | PATCH | DELETE /v1/schedules/:id`, que é encaminhado ao Durable Object correspondente (`idFromName(scheduleId)`). Qualquer outra coisa é 404.
- `src/timer-schedule.ts` — a Durable Object `TimerSchedule`: um objeto por timer, guardando um único registro em `storage` sob a chave `schedule` e um `alarm` marcado para o instante de término.
- `src/schedule-state.ts` — lógica pura de validação/criação do estado (`createScheduleState`) e da decisão de postergar o alarme (`shouldDeferAlarm`). É aqui que mora a parte testável.
- `src/types.ts` — `WorkerEnv`, `TimerScheduleEnv`, `ScheduleState`.

Fluxo: o cliente faz `PUT` com `endAt`, `title`, `deepLink`, a `subscription` de push e um `visibleUntil`; a DO persiste e agenda o alarme para `endAt`. Quando o alarme dispara, se `shouldDeferAlarm` indicar que a aba ainda está visível, o alarme é reagendado para 5 segundos depois (`VISIBLE_GRACE_MS`) em vez de notificar — o frontend renova esse lease a cada 5 segundos enquanto está em primeiro plano. Caso contrário, o estado passa a `delivered` e o push é enviado com `web-push` (`TTL: 60`, `urgency: 'high'`).

## Invariantes a preservar

- **Autorização é por capability token.** `PATCH` e `DELETE` só são aceitos se o `capability` enviado bater com o guardado; o token é gerado e armazenado no cliente. Não introduza rota que altere ou leia um agendamento sem essa verificação, e não exponha o token em resposta.
- **Subscription morta é limpa, não repetida.** Se o `web-push` responder 404 ou 410, o registro é apagado; outros erros são relançados de propósito para que a Cloudflare registre a falha e faça retry. Mantenha essa distinção.
- Um agendamento por DO: `PUT` substitui o anterior. Não acumule histórico aqui.
- `allowedOrigins` em `src/index.ts` é a lista fechada de origens com CORS (`https://do0ori.github.io` e `http://localhost:3000`). Se o frontend passar a ser publicado em outro domínio, essa lista precisa acompanhar — sem isso, os alertas em background silenciosamente param de funcionar.

## Configuração e deploy

- `wrangler.jsonc` declara o binding `TIMER_SCHEDULE`, a migration `v1` (`new_sqlite_classes`) e `nodejs_compat` (necessário para a lib `web-push`).
- Segredos: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Localmente vão em `.dev.vars` (modelo em `.dev.vars.example`); em produção, via `wrangler secret put`. Nunca comite valores reais.
- Desenvolvimento e publicação com `npx wrangler dev` e `npx wrangler deploy` executados **dentro deste diretório** (o `wrangler` está no `devDependencies` da raiz).
- A chave VAPID pública aqui tem que ser a mesma usada para gerar a subscription no cliente; trocar o par VAPID invalida todas as subscriptions existentes.

## Testes

`src/schedule-state.test.ts` roda no Jest da raiz (`npm test`, executado na raiz do repositório). Mantenha a lógica nova em `schedule-state.ts` ou em outro módulo puro para que continue testável sem subir o runtime do Workers.
