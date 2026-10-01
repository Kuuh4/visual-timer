# Devlog

Registro discursivo das decisões de desenvolvimento: o porquê de cada mudança, as alternativas consideradas e os pontos que ficaram abertos. O `CHANGELOG.md` continua sendo o registro direto do que mudou; aqui fica o raciocínio. Entradas mais recentes primeiro.

## 2026-10-01 — Layout compacto para janelas quadradas

### O problema observado

Ao reduzir a janela a um pequeno quadrado, o relógio não ficava centralizado: aparecia visivelmente deslocado para baixo.

### Diagnóstico

Com proporção próxima de 1, o app caía no layout vertical (`aspectRatio > 1 ? horizontal : vertical`, em `TimerContent`). Esse layout é um `flex-col` com `justify-between` em que o relógio ocupa apenas o espaço sobrante, via `flex grow items-center justify-center`. As duas faixas que cercam esse espaço têm alturas diferentes: a de cima soma os botões do topo mais o `TimeDisplay` (~110px), a de baixo tem só a linha de controles (~44px). O relógio era centralizado dentro da faixa restante, e o centro dessa faixa fica abaixo do centro da viewport pela metade da diferença — daí o deslocamento de algumas dezenas de pixels. Não era um bug de cálculo, e sim consequência direta da assimetria entre as faixas.

### Alternativas consideradas

Três saídas foram levantadas para o layout vertical, todas com custo:

1. **Reservar espaço igual acima e abaixo** (o maior dos dois). Centraliza de verdade, mas encolhe o relógio pela diferença entre as faixas — constante em pixels, então proporcionalmente pior justamente nas janelas pequenas, que são o caso de uso em questão.
2. **Manter o tamanho e centralizar na viewport**, aceitando que o mostrador encoste ou sobreponha o display de tempo. Centralização correta, custo visual.
3. **Equilibrar o layout**, movendo o display de tempo para a faixa de baixo. Resolve sem encolher nada, mas muda o design das telas grandes, que não têm o problema.

Nenhuma das três agradava: todas pagavam, no layout padrão, por um problema que só aparece na janela quadrada. No routine timer o custo da opção 1 seria pior ainda, porque a faixa superior inclui a lista de etapas — reservar o espelho dela deixaria o relógio minúsculo.

### Decisão

Em vez de ajustar o layout vertical, criar um **terceiro layout** específico para viewports quase quadradas, com um raciocínio geométrico diferente: o relógio é maximizado e limitado pela menor medida da janela (`100vmin`), centralizado nos dois eixos, e os controles vão para os quatro cantos.

O ponto que torna isso possível sem concessão de tamanho: um círculo inscrito em um quadrado nunca alcança os cantos do quadrado. O mostrador tem raio de 90% do quadrado (`baseRadius` 45 em um `viewBox` de 100), então sobra folga suficiente nos cantos para botões de 64px e para o switch de unidade de 96×40 sem nenhuma sobreposição. O relógio fica com o tamanho máximo possível e perfeitamente centralizado — as duas coisas ao mesmo tempo, que era o que as três alternativas anteriores não conseguiam.

Decisões de detalhe:

- **Critério de ativação:** proporção quadrada (razão entre 0,8 e 1,25), em qualquer tamanho, como padrão. O critério de tamanho (menor lado ≤ 480px) virou uma configuração opcional — "Compact layout: only small windows" — para quem preferir que uma janela quadrada grande continue no layout normal. A lógica ficou isolada em `src/utils/layoutMode.ts`, pura e testada, seguindo o padrão do repositório de extrair comportamento para `utils/` em vez de testar componentes renderizados.
- **Quais controles ocupam os cantos:** são quatro vagas para cinco controles. O botão de home foi o preterido, porque é o único recuperável por outro caminho — ele só aparece quando um timer não-padrão está selecionado, e a lista de timers (canto inferior esquerdo) permite voltar ao timer padrão. O play/pause, sendo a ação primária, assumiu a vaga dele no canto superior esquerdo.
- **Display de tempo:** sobreposto dentro do mostrador, na faixa branca entre o anel de progresso (que vai até ~46% do raio) e os números do relógio (~78%), com fonte em `vmin` para escalar junto com a janela. Virou configuração também, porque o próprio mostrador já comunica o tempo restante e há quem prefira o relógio limpo.

As duas configurações novas foram adicionadas ao `settingsStore` com migração para a versão 4. Aproveitando, a função `migrate` foi corrigida: ela usava `return` dentro de cada degrau, então uma instalação muito antiga pulava as migrações seguintes; agora os degraus se acumulam.

### Refatorações que vieram junto

- `ControlButtons` era um componente monolítico que montava a linha inteira (lista/+tempo, play/pause, configurações/reset). Como o layout compacto precisa dos mesmos botões em posições independentes, os três viraram componentes próprios (`ListOrAddButton`, `StartStopButton`, `SettingsOrResetButton`) e `ControlButtons` ficou sendo apenas a linha que os distribui. `BaseTimer` e `RoutineTimer` agora passam os nós de controle para o `TimerContent`, que decide entre linha e cantos — antes passavam um `bottom` opaco.
- `useAspectRatio` foi substituído por `useViewportMetrics`, que devolve largura, altura, razão e menor lado. A decisão de layout precisa do menor lado, e espalhar um segundo listener de `resize` seria desperdício.

### Ajustes depois do primeiro teste

Dois refinamentos saíram de ver o layout funcionando.

**Janela muito estreita descarta os outros layouts.** O critério de proporção sozinho deixava passar um caso ruim: uma janela de 1200×200, por exemplo, tem razão 6 e ia para o layout horizontal, onde nada caberia. O limite virou um pouco acima de um oitavo de 1920px — 256px — aplicado a largura e altura **de forma independente**: se qualquer uma das duas é igual ou menor que isso, o layout compacto assume, qualquer que seja a proporção. Nesse regime o relógio continua dimensionado pelo menor lado, então uma janela comprida e baixa mostra o mostrador centralizado com os controles longe, nos cantos da janela — não é bonito, mas é o único arranjo em que o relógio continua legível.

**Controles em formato de quina.** À medida que a janela quadrada encolhe, os cantos livres encolhem mais rápido que os botões, que têm tamanho fixo de 64px — chega um ponto em que o botão redondo invade o mostrador. Em vez de escolher um breakpoint arbitrário, a condição é geométrica: o canto interno do botão (a 64+8px da borda) é comparado com o raio do mostrador (45% do menor lado), e o formato muda quando ele entra no círculo. Isso dá a troca em torno de 396px de lado para uma janela quadrada, e corretamente **não** troca em janelas compridas, onde os cantos continuam espaçosos.

O formato novo é um bloco ancorado na quina com a borda interna côncava, acompanhando o arco do mostrador. A implementação usa `mask-image` com um `radial-gradient` em vez de `clip-path`: `clip-path` não descreve um recorte côncavo com facilidade, enquanto a máscara simplesmente **subtrai** o círculo do quadrado da quina. O círculo da máscara é posicionado em unidades de viewport (`50vw`/`50vh`, ou `calc(100% - 50vw)` nas quinas ancoradas à direita/base), o que funciona porque o mostrador é sempre centralizado na viewport e tem raio de `45vmin` — então cada quina sabe onde o círculo está sem precisar medir nada em JavaScript.

Consequências de detalhe:

- O conteúdo da quina vai para a ponta externa, a única parte que o mostrador nunca invade.
- A máscara recorta o elemento inteiro, inclusive sombra e feedback de toque. O `btn-tactile`, que responde ao toque com `scale(0.94)`, foi desativado nesse formato — escalar um elemento ancorado na quina o descolaria da borda; ele escurece no lugar.
- O switch de unidade (um pill de 96×40) não cabe numa quina. Nesse formato ele colapsa para apenas o rótulo atual (`min`/`sec`, ou o ícone de repetição no routine timer), continuando a alternar no toque.
- `Button` e `Switch` descobrem o formato por contexto (`cornerSlot.ts`), não por prop. O layout é quem sabe a quina e o formato; os controles são construídos em `BaseTimer`/`RoutineTimer`, que não têm — e não deveriam ter — acesso às medidas da viewport.

### Segunda rodada: acabamento das quinas

Cinco ajustes pedidos depois de ver as quinas funcionando.

**Uma folga só para o modo compacto.** Antes, a distância entre o mostrador e a parede era consequência acidental do SVG: o círculo é pintado a 92% da caixa (`baseRadius` 45 mais meio traço de 2, sobre um meio-`viewBox` de 50), então uma caixa de `100vmin` deixava 4vmin de folga — 24px numa janela de 600px, proporcional em vez de constante. Agora existe uma constante única, `COMPACT_GAP_PX = 8`, e a caixa do mostrador é ampliada pelo inverso de 0,92 para que a folga se aplique à **borda pintada**, não ao canto vazio do SVG. A mesma constante governa a distância dos controles à parede (que é o `inset-2` do Tailwind, exatamente 8px) e a distância entre mostrador e controle. Efeito colateral aceito: a caixa do SVG passa a ser mais larga que a viewport no eixo curto, e o que transborda são só os cantos vazios — o container ganhou `overflow-hidden`.

**O recorte circular já existia.** A pergunta era se a quina que encosta no círculo poderia ser aparada para contorná-lo. Ela já era: desde a primeira rodada, o `mask-image` subtrai o círculo do quadrado, não é o quadrado passando atrás de um mostrador opaco. O que impedia de perceber a diferença era justamente a folga de 4px entre o recorte e o mostrador — com um mostrador opaco por cima, recorte real e sobreposição escondida são visualmente idênticos. Com a folga agora explícita e igual em todos os lados, o contorno aparece. O raio do recorte é `50vmin`, e vale notar por que: a borda pintada fica a `50vmin - gap` do centro e o controle guarda mais um gap dela, então os dois se cancelam.

**Cantos arredondados e posição do ícone.** O quadrado ganhou `border-radius` de um sétimo da própria largura, e o conteúdo passou a ser posicionado por coordenada em vez de alinhamento flex: o centro do ícone fica a um terço da largura do quadrado de cada uma das duas bordas mais próximas. Posicionar por `left`/`top` com `translate(-50%, -50%)` nas quatro quinas exigia inverter o sinal do translate nas ancoradas à direita/base; usar sempre `left`/`top` (com `2/3` no lugar de `1/3` quando a quina é a oposta) mantém um único `translate` e menos casos especiais.

O tamanho do quadrado — `27vmin` — passou a ter uma restrição real: como o ícone fica a um terço dele para dentro, um quadrado grande empurra o ícone na direção do mostrador, onde a máscara o corta. Na menor janela compacta possível (256px) um ícone de ~30px ainda cabe com `27vmin`; com os `30vmin` da primeira rodada, a ponta interna do ícone era aparada. Abaixo de ~250px essa margem acaba, mas aí a interface já está degenerada.

Como a folga entre mostrador e parede caiu de 4vmin para 8px fixos, o mostrador ficou maior e a condição geométrica das quinas mudou junto: um botão redondo agora precisa vencer metade do lado curto (não mais 45% dele), o que antecipa a troca de formato de ~396px para ~491px de lado.

### Terceira rodada: distribuição pelas quinas

**Quinas inferiores espelhadas.** Reset passou para a quina inferior esquerda e o `+1` para a direita — o inverso da linha de controles dos outros layouts. Vale registrar a consequência: como cada uma dessas vagas troca de função conforme o estado (parado/rodando), o espelhamento também move configurações para a esquerda e lista de timers para a direita enquanto o timer está parado. O espelhamento vale apenas no layout compacto; a linha dos layouts vertical e horizontal continua na ordem original.

**Tempo na quina superior direita como terceira opção.** A configuração do tempo no modo compacto deixou de ser booleana e virou três estados (`dial`, `corner`, `hidden`), com migração da versão 5 do store que converte o booleano antigo (`false` → `hidden`, resto → `dial`).

A vaga superior direita, porém, já era do switch de unidade/repetição — quatro quinas para cinco controles de novo. A solução foi uma troca de lugar em vez de uma remoção: nessa opção o pill do switch assume o ponto do mostrador que o tempo desocupou. O raciocínio é que o switch de unidade só aparece com o timer parado (nem pausado), então sobrepô-lo ao mostrador nunca esconde uma contagem em andamento — e o tempo, que é o que importa enquanto roda, ganha uma quina própria, fora do mostrador. O switch de repetição do routine timer é a exceção: ele não se esconde, então fica sobre o mostrador o tempo todo nessa opção.

O `CornerTimeDisplay` não tem fundo: ele só empresta a geometria da quina (o mesmo recorte e o mesmo deslocamento de um terço usado pelos ícones), o que o mantém alinhado com os botões e fora do mostrador sem precisar de um segundo conjunto de medidas.

### Correção: switch de unidade com o timer pausado

O switch de minutos/segundos reaparecia quando o timer era pausado. A causa é que ele era controlado por `isRunning`, que é falso tanto no estado inicial quanto em pausa — mas trocar a unidade chama `toggleUnit`, que **reinicia** a contagem. Ou seja, o controle voltava a aparecer exatamente num momento em que usá-lo destruiria a contagem em andamento sem aviso.

O estado correto é `isInitialized`, que só é verdadeiro enquanto o timer está intocado (e volta a ser depois de um reset). Aproveitei para trocar a prop do `UnitSwitch` de `isRunning` para `isVisible`: antes, `BaseTimer` passava `isRunning={timer.id === defaultTimer.id ? isRunning : true}` para esconder o switch em timers salvos — uma dupla negativa que escondia a intenção real ("só o timer padrão pode trocar a unidade, e só enquanto está parado"). Com `isVisible` a condição fica legível no ponto de uso.

### Nomes e destino de publicação

O repositório tem dois nomes de propósito. No GitHub ele continua `visual-timer`, porque é o nome do repositório que forma o caminho `/visual-timer/` do GitHub Pages — o mesmo caminho que está no `base` do Vite, no `scope`/`start_url` do PWA, nos deep links e nos caminhos dos áudios de alarme (inclusive em `selectedAlarm` já persistido no `localStorage` dos usuários). Renomeá-lo ali obrigaria a trocar todos esses caminhos e a migrar o alarme salvo. Do lado privado, no Forgejo, o repositório é `visual.timer`, seguindo a convenção de pastas do usuário; o nome com ponto não toca em nada do runtime.

Daí a configuração de remotos: `origin` é o Forgejo (padrão de hospedagem) e `github` é o fork que serve o Pages.

Vale registrar uma limitação de CORS que não é óbvia: liberar `https://kuuh4.github.io` no Worker é liberar o **host**, não o caminho — serve para qualquer página publicada nesse domínio. E a liberação só tem efeito depois de um deploy do Worker; o Worker em produção é o do upstream, então alertas em background neste fork dependem de deployar um Worker próprio, com chaves VAPID próprias.

### Em aberto

- Os valores de 0,8–1,25 para "quadrado" e 480px para "pequeno" são escolhas iniciais, não medidas — vale ajustar com uso real. O limite de 256px e a condição geométrica das quinas, por outro lado, têm justificativa.
- No regime forçado (um lado ≤ 256px) com a janela muito comprida, os controles ficam nos cantos da janela, distantes do mostrador. Talvez valha aproximá-los do quadrado do relógio em vez de ancorá-los na janela.
- O tamanho da quina (`27vmin`) sobra área de toque depois da máscara, mas não foi testado com toque real em tela pequena.
- A folga de 8px é uniforme por decisão de coerência. Numa janela grande e quadrada ela pode parecer apertada demais; se for o caso, o caminho é torná-la relativa com um piso em px, não voltar a um valor puramente proporcional.
- A posição vertical do display de tempo dentro do mostrador (`top-[22%]`) foi calculada a partir dos raios do SVG, mas não foi validada visualmente em várias proporções.
- O routine timer perde a lista de etapas no layout compacto, já que não há espaço para ela. Hoje a única forma de ver a etapa atual é pela cor do mostrador e pelo texto do tema; talvez valha indicar a posição na rotina de alguma forma econômica.
