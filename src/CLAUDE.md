# CLAUDE.md — `src/` (frontend React)

Complementa o `CLAUDE.md` da raiz (comandos, convenções de formatação, variáveis de ambiente). Aqui está a arquitetura da aplicação.

## Bootstrap (`index.tsx`)

Tudo que acontece uma vez na inicialização está em `index.tsx`: `configureTimerNotificationApiUrl` injeta a base URL do Worker a partir de `import.meta.env`, um listener `click` com `{ once: true }` pede permissão de notificação no primeiro gesto do usuário, o Sentry é inicializado só se houver DSN (com `beforeSend` anexando o `localStorage` e a tag `own_code` para separar erros de extensões de navegador), o router é criado com `basename: '/visual-timer'` e o service worker é registrado com `registerSW({ immediate: true })`. O roteamento é raso: `/` renderiza `App` (dentro de um `Sentry.ErrorBoundary`) com `MainPage` como filho, e `*` cai em `NotFoundPage`.

## Organização das pastas

- `pages/` — `MainPage`, `ErrorPage`, `NotFoundPage`. `App.tsx` é só o shell: renderiza o `<Outlet />` e aplica o tema ao `<body>`.
- `components/common/` — primitivos reutilizáveis (`Button`, `Dropdown`, `Switch`, `TimerFace`, `Tooltip`, `TopBar`, `Layout`…).
- `components/timers/` — a feature principal, subdividida em `base-timer/`, `routine-timer/`, `shared/` (displays e controles compartilhados) e `timer-management/` (overlays e formulários de criação/edição, com `fields/` e `forms/`).
- `components/settings/` — overlay de configurações, organizado em `sections/` (abas), `fields/` (controles individuais) e `forms/`.
- `components/stats/` — overlay de estatísticas de foco e geração do card compartilhável.
- `components/icons/` — ícones SVG como componentes, reexportados por `index.ts`.
- `config/` — constantes de domínio: `timer/units.ts` (minutos vs. segundos: `interval`, `multiple`, `denominator`), `timer/type.ts` (`TIMER_TYPE`), `audio/alarms.ts`, `theme/themes.ts`.
- `hooks/` — hooks próprios; `useTimer` é o coração da aplicação (ver abaixo).
- `store/` — stores Zustand, com os tipos em `store/types/`.
- `services/` — integração com service worker, push e notificações locais.
- `utils/` — funções puras (tempo, cor, áudio, prazos de timer, payloads de notificação).
- `service-worker.ts` — service worker do PWA, injetado pelo `vite-plugin-pwa`.

Ao criar um componente, siga a hierarquia existente (`feature/subcategoria/Componente.tsx`) em vez de achatar tudo numa pasta só. Campos de formulário vão em `fields/`, formulários completos em `forms/`, seções de overlay em `sections/`.

## Layouts

`components/timers/shared/TimerContent.tsx` escolhe entre três layouts, e `utils/layoutMode.ts` concentra a decisão (pura e testada): `horizontal` (viewport larga: relógio à esquerda, informações à direita), `vertical` (viewport alta: tudo em coluna) e `compact` (viewport quase quadrada, ou com qualquer um dos lados ≤ 256px — aí não há layout alternativo viável).

O layout compacto existe porque, numa janela quadrada, o relógio só pode ser grande **e** centralizado se nada dividir a altura com ele: ele é dimensionado por `100vmin` e centralizado, e os controles vão para os quatro cantos — espaço que o círculo inscrito no quadrado nunca alcança. Como são quatro cantos para cinco controles, o botão de home não aparece nesse layout (é recuperável pela lista de timers), e o play/pause ocupa a vaga dele. As quinas inferiores são espelhadas em relação à linha de controles dos outros layouts (reset à esquerda, `+1` à direita). Duas configurações governam o modo: `compactOnlyOnSmallViewports` (restringe o compacto a janelas pequenas) e `compactTimeDisplay` (`dial`, `corner` ou `hidden` — em `corner` o tempo ocupa a quina superior direita e o pill do switch assume o ponto que ele desocupa no mostrador).

Quando a janela encolhe o bastante para um botão redondo de 64px invadir o mostrador — condição geométrica em `shouldUseWedgeCorners`, não um breakpoint fixo —, os controles mudam de formato: `components/common/cornerSlot.ts` fornece, por contexto React, a quina e o formato, e `Button` e `Switch` se redesenham como um bloco arredondado de quina cuja borda interna é o arco do mostrador. O recorte côncavo vem de `mask-image` com `radial-gradient` posicionado em `vw`/`vh`, aproveitando que o mostrador é sempre centralizado na viewport — nenhuma medição em JavaScript. Use o contexto, e não props, ao fazer um controle novo entender a quina: quem conhece as medidas é o layout, não `BaseTimer`/`RoutineTimer`, onde os controles são construídos.

Toda a geometria do modo compacto deriva de duas constantes em `utils/layoutMode.ts`: `COMPACT_GAP_PX` (a folga única entre mostrador, controles e paredes) e `DIAL_EDGE_RATIO` (os 92% da caixa onde o SVG realmente pinta a borda, usado para ampliar a caixa do mostrador de modo que a folga valha para o círculo e não para o canto vazio do SVG). Ao mexer em espaçamento nesse modo, altere a constante — não um valor solto num componente.

Os três layouts compartilham os mesmos controles: `ListOrAddButton`, `StartStopButton` e `SettingsOrResetButton` são componentes independentes, e `ControlButtons` é apenas a linha que os distribui nos layouts vertical e horizontal. Ao acrescentar um controle, passe-o pelo objeto `controls` do `TimerContent` em vez de embutir na linha — senão ele existe num layout e não no outro. O racional completo dessa decisão está no `DEVLOG.md` da raiz.

## Estado (Zustand)

Um store por responsabilidade: `baseTimerStore`, `routineTimerStore`, `selectedTimerStore`, `settingsStore`, `statsStore`, `themeStore`. Stores persistidos guardam estado do usuário em `localStorage` — qualquer mudança no shape precisa considerar dados já salvos de versões anteriores (migração ou leitura tolerante), porque os usuários não começam de zero.

Os tipos de domínio ficam em `store/types/timer.ts` (`BaseTimerData`, `RoutineTimerItem`, `RoutineTimerData`, união `TimerData`) e `store/types/theme.ts`.

## `useTimer` — a parte delicada

`hooks/useTimer.ts` é a peça central e a mais fácil de quebrar. Pontos que precisam ser preservados:

- **A contagem é derivada de um instante de término (`endAtRef`), não de decrementos.** O intervalo recalcula o restante com `getRemainingCount` (`utils/timerDeadline.ts`). Nunca volte a decrementar um contador a cada tick: throttling de aba em background tornaria a contagem imprecisa.
- Toda ação que invalida o prazo (`stop`, `reset`, `setTime`, `toggleUnit`, troca de `initialTime`) precisa zerar `endAtRef` **e** cancelar a notificação agendada e o status de timer rodando.
- `finishTriggeredRef` existe para `onFinish` não disparar duas vezes; mantenha a guarda.
- Enquanto a aba está visível, o timer renova um "lease" de visibilidade (`visibleUntil = agora + 15s`) a cada 5 segundos, para que o backend não envie push enquanto o usuário está olhando a tela. Ao esconder a aba, o lease é removido (`visibleUntil: null`) e uma notificação de status é exibida. Esse par de comportamentos é o que evita alerta duplicado e alerta ausente — mexa nele junto com `docs/superpowers/` em mãos.
- `useWakeLock(isRunning)` mantém a tela ligada durante a contagem.

## Serviços e notificações

- `services/timerNotificationService.ts` — agenda (`PUT`), renova e cancela (`DELETE`) agendamentos no Worker, e cuida da subscription de Web Push. As credenciais por timer (`scheduleId` + `capability`) são criadas e guardadas em `localStorage` sob a chave `timer-notification:<timerId>`; é esse token que autoriza cancelar/alterar o agendamento depois. Sem `VITE_TIMER_NOTIFICATION_API_URL` ou sem subscription ativa, as funções retornam cedo — o app precisa continuar funcional nessa situação.
- `services/timerStatusNotification.ts` — notificação local de "timer rodando" quando a aba vai para background.
- `services/serviceWorkerMessages.ts` — protocolo de mensagens entre página e service worker.
- Chamadas de agendamento/cancelamento são fire-and-forget: falhas são logadas com `console.debug` e nunca rejeitam para o chamador.

## Testes

Jest com `jest-environment-jsdom`, transformação via Babel (`babel.config.cjs`), setup em `setupTests.ts`. Os testes vivem ao lado do código (`*.test.ts`) e cobrem principalmente a lógica pura: `utils/timerDeadline`, `utils/timerNotificationPayload`, `utils/colorMode`, `utils/editorDialStyles`, `utils/soundEngine`, `utils/audioPreviewController`, os serviços de notificação e `settingsStore`. `tooling.test.ts` verifica a própria configuração do projeto.

Preferência clara do repositório: extrair lógica para `utils/` puros e testá-los ali, em vez de testar componentes renderizados. Siga esse padrão ao adicionar comportamento novo.
