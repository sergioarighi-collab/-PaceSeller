# Guia técnico — dev frontend

Documento vivo. Sempre que uma tela/feature nova entrar ou uma existente mudar de forma relevante, atualize aqui — ver `CLAUDE.md` na raiz do repo.

Este guia cobre a implementação (código). Para regras de negócio e histórico de decisões com o cliente, ver os docs em `docs/` (principalmente `cruzamento-reuniao-cliente.md`, que é a fonte mais recente/confiável quando conflita com os outros).

## Stack

React + TypeScript + Vite, `react-router-dom` (rotas client-side), Zustand (estado global leve). Sem backend — tudo em `app/src/lib/data.ts` (dados mock) e `app/src/lib/store.ts` (estado de sessão/carrinho).

```bash
cd app && npm install && npm run dev     # dev server
cd app && npm run build                  # tsc -b && vite build
```

## Estrutura de pastas (`app/src/`)

```
screens/lojista/       telas do fluxo desktop do lojista (o que está ativo hoje)
screens/representante/ telas do representante — mobile antigo, não retrabalhado nesta leva
screens/shared/        telas de convergência do protótipo mobile antigo
components/desktop/    componentes compartilhados do fluxo desktop (ver abaixo)
components/ui/         componentes do protótipo mobile antigo
components/layout/     shells de navegação do protótipo mobile antigo
lib/types.ts           tipos (Product, Carrinho, Pedido, ...)
lib/data.ts            catálogo mock, carrinhos mock, insights do radar etc.
lib/store.ts           estado global (zustand): persona, carrinho em montagem, onboarding, etc.
lib/format.ts          formatBRL
styles/mockup.css      CSS literal extraído do mockup HTML de referência (`telas/`) — ver convenção abaixo
assets/images/          fotos reais (hero de login, banner do Radar)
```

**Importante:** o fluxo desktop do lojista (`screens/lojista` + `components/desktop`) é a parte ativa do produto. `screens/representante`, `screens/shared` e `components/ui`/`components/layout` são do protótipo mobile anterior e não foram retrabalhados — não assuma que seguem os mesmos padrões deste guia.

## Convenção de CSS — por que não é Tailwind

O app tem um mockup HTML de referência pixel-perfect em `telas/telas-desktop-lojista.html` (37 telas). Em vez de reimplementar esse visual em utility classes, o CSS de lá foi **extraído literalmente** para `app/src/styles/mockup.css`, e os componentes React usam os **mesmos nomes de classe** do mockup (ex: `pcard-web`, `pw-thumb`, `web-sidebar`, `nudge-bar`). Isso garante fidelidade pixel a pixel com o que o cliente aprovou.

Ao criar uma tela nova: **procure primeiro se já existe uma classe/padrão equivalente no mockup.css** antes de escrever CSS novo. Estilos pontuais (que não existem no mockup) vão inline via `style={{}}`, seguindo o padrão já usado nas telas existentes.

### Tokens (definidos em `:root` no topo de `mockup.css`)

- Cores: `--surface` (branco), `--surface-2`/`--surface-3` (cinza claro, usado como fundo de página/painel, não de card — ver seção Cards), `--border`/`--border-strong`, `--text-primary`/`--text-secondary`/`--text-tertiary`, `--black`, `--positive`/`--positive-dim` (verde), `--risk`/`--risk-dim` (vermelho), `--info`/`--info-dim` (azul).
- Fontes: `--display` (Space Grotesk, títulos), `--body` (IBM Plex Sans, texto), `--mono` (IBM Plex Mono, preços/dados/labels uppercase). Carregadas via Google Fonts em `src/index.css`.

### Padrão de card sem borda (decisão do cliente, ago/2026)

Cards de produto **não têm borda própria** — a delimitação vem do card ser branco (`--surface`) sobre um painel cinza claro (`--surface-2`) ao redor (`.catgrid-web`), com `gap` entre os cards fazendo a separação. Ver `.pcard-web`/`.catgrid-web` em `mockup.css`. Esse padrão foi replicado em qualquer lugar que mostra foto de produto (thumb do carrinho, sidebar, ficha de decisão) — sempre fundo branco + esse tipo de moldura, nunca borda 1px direto no elemento.

### Cor de texto clicável = `--info` (ago/2026)

Elemento de texto que navega pra outro lugar (breadcrumb, CTAs de card como "Ver produto →"/"Repor agora →"/"Comparar →") usa `var(--info)` (azul, já existia no sistema mas quase não era usado). Antes disso, links de texto herdavam a cor do texto ao redor (`color: inherit`) e ficavam indistinguíveis de texto estático — só o cursor sinalizava que eram clicáveis. A classe `.cta` em `mockup.css` já aplica isso por padrão; um estado como "✓ Reposto" continua sobrescrevendo pra `--positive` via style inline quando faz sentido semântico diferente de "isto é um link".

**Não generalizar além disso sem necessidade** — botões (`.btn-primary`/`.btn-secondary`) já se comunicam como clicáveis pela própria forma (preenchido/bordado), não precisam de `--info`.

### Hierarquia dentro do card de produto (ago/2026)

Nome da linha (`.pw-name`) é o elemento mais forte do card (700/15.5px) — preço fábrica (`.pw-pricemain`) é claramente secundário mas ainda com peso (700/13.5px, só menor) — cor da variante (`.pw-colorway`) e PDV/margem ficam como detalhe terciário. Na Ficha de Decisão, o primeiro item de "Por que comprar este produto" (`p.why[0]`, que nos dados já é o motivo mais relevante — `riskCallout` quando existe, senão a métrica de crescimento) ganha peso maior e o ícone de check em `--positive` em vez de preto, pra não apresentar 4 motivos como se tivessem a mesma importância quando os dados já são ordenados por relevância.

### Botão/CTA fixado embaixo do card, mesma altura na fileira (ago/2026)

Em qualquer grid de cards com conteúdo de altura variável (linhas de produto com número diferente de swatches/badges no catálogo; cards de oportunidade do Radar com textos de tamanho diferente), o elemento de ação (`.pw-addbtn` no catálogo, `.cta` no Radar) precisa alinhar na mesma posição vertical entre os cards da mesma fileira — senão o botão "flutua" em alturas diferentes dependendo do quanto de conteúdo tem acima.

O grid (`.catgrid-web`/`.grid4`) já estica cada card pra altura do maior da fileira (comportamento padrão do CSS Grid, `align-items:stretch`). O que faltava era o conteúdo *dentro* do card aproveitar esse espaço extra pra empurrar o botão pra baixo. Padrão aplicado:

- O card vira flex column (`.pcard-web{display:flex;flex-direction:column}`, `.web-icard{display:flex;flex-direction:column}`).
- A área de thumb/imagem leva `flex-shrink:0` pra não ser espremida.
- A área de corpo (`.pw-body`) também vira flex column com `flex:1`.
- O botão/CTA leva `margin-top:auto` — empurra pro fim do espaço disponível, ficando sempre na base do card, alinhado com os outros da fileira.
- No `.cta` do Radar, como cada instância também definia `marginTop` inline via `style` (React), isso tinha prioridade sobre a classe CSS — foi removido do inline; a classe `.cta` tem `padding-top` fixo (junto do `margin-top:auto`), garantindo espaçamento mínimo mesmo quando o card é o mais alto da fileira e a margem automática vira 0.

**Padrão a seguir em novos grids de card**: se o card tem um botão/link de ação no fim e o conteúdo acima varia de tamanho, usar essa combinação (flex column no container + `flex:1` no corpo + `margin-top:auto` no elemento de ação), em vez de `margin-top` fixo em px.

**Correção (ago/2026):** só `margin-top:auto` no botão não bastava pro `ProductLineCard` — quando o card era o mais alto da própria fileira (ex: Coil com grade de 10 swatches em 2 linhas), a margem automática colapsava pra `0` e o botão ficava colado nos swatches ("espremido", relatado pelo usuário). `padding-top` fixo não dava pra usar ali como no `.cta` porque `.pw-addbtn`/`.pw-compare` têm fundo/borda visível — padding ali deixaria o botão mais alto, não abriria espaço *acima* dele. Fix: um `<div style={{ flex: '1 0 14px' }} />` (flex-grow:1, flex-basis:14px) inserido logo antes do botão/comparação em `ProductLineCard.tsx` — cresce pra empurrar o botão pro fim quando sobra espaço (mesmo efeito do `margin-top:auto`, que foi removido de `.pw-addbtn`/`.pw-compare`), mas nunca fica menor que 14px, garantindo um respiro mínimo real mesmo no card mais alto da fileira. Esse é o padrão a preferir quando o elemento de ação tem fundo/borda própria (`margin-top:auto` sozinho só é suficiente quando o elemento é "invisível", como o `.cta` de puro texto do Radar).

### Cards do Radar — cor de severidade cheia + ícone + número em destaque (ago/2026)

O usuário achou os 4 cards de "Oportunidades de hoje" (`.grid4`/`.web-icard` em `Radar.tsx`) visualmente fracos pra serem a primeira coisa que a loja vê ao logar — antes eram fundo branco/cinza com só uma barrinha de 6px na cor de severidade. Esboço comparado com o usuário (2 variantes, Artifact) e escolhida a de mais peso: a cor de severidade agora preenche o card inteiro, não só a borda.

- **Tom por card** (`cardVisual()` em `Radar.tsx`): `card.opportunity` → `tone-black` (fundo preto sólido, igual ao banner "Destaque da semana" — é o card mais importante do grupo); senão por `severity` → `tone-risk`/`tone-info`/`tone-positive` (fundo `--risk-dim`/`--info-dim`/`--positive-dim`). Uma ação "resolvida" (ex: `repostos.has(...)` depois de clicar "Repor agora") força `tone-positive` + ícone de check, independente da severidade original — confirma visualmente que a ação foi concluída (mesmo padrão do "No carrinho" do `ProductLineCard`).
- **Ícone de categoria** (`ToneIcon` em `Radar.tsx`): badge circular colorido por tom, com um SVG por tipo de insight (estrela pra oportunidade, alerta pra estoque baixo, comparação pra benchmark, "+" pra lançamento, check pra ação resolvida).
- **Número em destaque** (`.web-icard .stat`, campo opcional `stat` em `InsightCardData`/`lojistaRadarInsights`): a métrica central do card (ex: "+34%", "32 un.") puxada pro topo em tipografia grande (`--display`, 30px) em vez de ficar só embutida no meio da frase do `text`. Campo opcional porque nem todo insight tem uma métrica única e limpa pra puxar.
- No card `tone-black`, o selo "Oportunidade" (que antes era um `.tag-black` separado) foi incorporado no próprio eyebrow (`Oportunidade · {card.eyebrow}`) — um badge preto sobre fundo preto não teria contraste nenhum.
- CTA continua no mesmo padrão de alinhamento da seção anterior (`margin-top:auto`), com a cor herdada do tom do card em vez de sempre `--info`.

### Radar agrupado por prazo + fim da pergunta de objetivo no onboarding (ago/2026)

Antes: onboarding tinha 3 etapas, a 3ª perguntava "o que você quer fazer agora?" (`goalId`) e o Radar tinha um botão "Ajustar foco" que dizia "isso reordena o que aparece primeiro no seu radar hoje" — **mas não reordenava nada de verdade** (`goalId` só marcava qual card ficava selecionado dentro do próprio modal). O usuário notou que isso não tinha efeito real e pediu pra tirar a etapa, trazendo em vez disso todas as pendências organizadas por prazo direto no Radar.

- **Onboarding agora tem 2 etapas** (`OnboardShell.tsx`, `steps` array). `WizardStep2.tsx` (antiga etapa 2) é quem agora finaliza o fluxo — o botão vira "Ir para o meu radar", chama `dismissOnboardingNotice()` e navega pra `/radar` direto (mesma ação que a extinta `GoalSelect.tsx` fazia). Rota `/onboarding/objetivo` e o arquivo `GoalSelect.tsx` foram removidos.
- **`goalId`/`setGoal`/`goals`/`openFocus`/`closeFocus`/`focusOpen` continuam existindo no store e em `data.ts`** — **não foram removidos** porque o fluxo mobile do representante (`screens/representante/Radar.tsx` + `components/ui/FocusSheet.tsx`) ainda usa esse mesmo mecanismo de "Ajustar foco". Só o uso no Radar **desktop do lojista** foi removido (o botão "Ajustar foco" e o modal correspondente saíram de `Radar.tsx`).
- **`lojistaRadarInsights` (`data.ts`) agora tem um campo `timeframe: 'hoje' | '15dias' | '30dias'`** em cada item, e passou de 4 para 11 itens — incorporou tudo que antes só existia escondido atrás do modal de categoria (`listModalContent`, removido) + um item novo (`ins-11`, "baixo giro/impulsionar com campanha", usando o produto que já tinha `riskCallout: 'Estoque parado'`). Nada foi inventado além desse último — os outros 10 já existiam em algum lugar da tela antiga.
- **Layout do Radar** (`Radar.tsx`): os cards continuam sendo exatamente o mesmo `.web-icard`/`cardVisual()`/`ToneIcon` de antes (nenhuma linguagem visual nova). A organização por prazo passou por 2 rodadas: primeiro um "meio-termo" (Hoje sempre aberta, 15/30 dias em acordeão fechado por padrão), depois o usuário pediu pra virar **filtro exclusivo** — chips `Hoje`/`Em 15 dias`/`Nos próximos 30 dias` no topo (`activeTimeframe` state, reaproveita literalmente o `.chip`/`.chip.selected` do filtro do Catálogo, só com uma contagem `.n` dentro), mostrando **só** o grupo selecionado por vez (troca de aba, não acumula). "Hoje" é o padrão ao carregar a página.
- **Removido de vez** (dado morto depois dessa mudança, sem uso em nenhum outro lugar): `dailyPanel` (`data.ts`), a seção "Todas as pendências — por categoria" e seu modal, e as classes CSS `.listgroup`/`.listrow`/`.goalcard`/`.gicon`/`.gtitle`/`.gsub`/`.gcheck`/`.focuslink-desktop`/`.wm-list`/`.wm-row` (e afins) em `mockup.css`.
- **Novos CTAs precisaram de destino real** — decisões tomadas caso a caso, sem inventar telas que não existem:
  - "Ver pedido" (alerta de atraso) → `/carrinhos/reposicao-rapida/4790-1/acompanhamento` (o pedido mock #4790-1 já existe em `data.ts`, é real).
  - "Ver clientes" (recuperar clientes) → `/fidelizacao`. **Gap conhecido**: essa é a tela `Loyalty.tsx`, que é do fluxo mobile/Tailwind (fora do desktop) — não existe hoje uma tela "Clientes" no desktop do lojista (o item de nav "Clientes" no `WebTopNav` é só texto cinza, sem rota). Revisitar se/quando um módulo de Clientes desktop for construído.
  - "Ver todos" (produtos em alta) → `/catalogo` (sem filtro específico — não existe um filtro "produtos em alta" implementado no Catálogo hoje).
  - "Ir pro Planejar" → `/planejamento` (já existia). **Desatualizado**: essa rota foi removida depois — ver "Planejar virou parte do fechamento do carrinho" mais abaixo.
- **Régua de prazo é ilustrativa** — os critérios usados pra classificar cada item em hoje/15/30 dias (cobertura de estoque, dias desde o lançamento, etc.) foram uma proposta feita durante o esboço, não vieram de reunião com o cliente. Se o critério real de "urgência" for diferente, só precisa remapear o campo `timeframe` de cada item em `data.ts` — a estrutura de UI não muda.

## Componentes compartilhados (`components/desktop/`)

| Componente | Uso |
|---|---|
| `DesktopPage` | wrapper de página (fundo, min-height) — também monta o `OrderDrawer` globalmente, ver seção própria abaixo |
| `WebTopNav` | navbar superior com menu do avatar e o ícone de sacola que abre o `OrderDrawer` |
| `Breadcrumb` | trilha de navegação abaixo da navbar |
| `OrderDrawer` | painel "Seu pedido" que desliza por cima da página (ver seção própria abaixo) — mostra itens do `cartItems` do store, nudge de grade mínima e de mix, sugestões de produto |
| `ProductThumb` | `<img>` de produto com fallback automático pro ícone placeholder (SVG de tênis) via `onError`, caso o SKU não tenha foto real ainda |
| `ProductLineCard` | card de produto **agrupado por linha** (ex: as 10 cores de Coil), com seletor de cor (miniaturas clicáveis) e selo "★ Mais vendida" na cor de maior `growthPct`. Usado no Catálogo e na página da Linha Fusion |
| `WebModal` | modal genérico |
| `Toast` | toast com auto-dismiss |
| `LoginSplitShell` | layout de login (hero com foto + form) |
| `OnboardShell` | layout do onboarding (rail com steps + form), tem o link "Já configurei, ir para o Radar" |

## Modelo de dados (`lib/types.ts`, `lib/data.ts`)

### Product

Cada cor de cada linha é um `Product` (SKU) próprio — ex: `Coil Black Reflect` e `Coil Denim` são dois `Product`s diferentes, ambos com `collection: 'COIL'`. Campos relevantes:

- `priceFactory` / `pricePdv` — preço de fábrica (o que o lojista paga) e PDV sugerido pela Tesla (ferramenta de proteção de posicionamento de marca, não é imposto). `pricePdv = calcPdv(priceFactory)` por padrão (~+65%, arredondado), com override manual por produto quando necessário (`raw[].pricePdv`).
- `growthPct` — crescimento de vendas do SKU no período. Usado para: badge "+X% crescimento" no card, filtro "Boa margem"/"Alto giro" não usa isso (usa `restockDays`/badge de margem), e **para decidir qual cor é a "mais vendida" da linha** (`ProductLineCard`/`buildProductLines` em `Catalog.tsx`).
- `colorway` — nome da cor sozinho (ex: "Black Reflect"), separado do `name` completo ("Tênis Tesla Coil Black Reflect"). Usado pro subtítulo do `ProductLineCard`.
- `reference` — formato `Linha-Ano-NúmeroDeLançamentoNoAno-Cor` (ex: `Fusion-2026-1-02`). Lançamento e cor são eixos diferentes; como o catálogo mock só tem 1 lançamento por linha em 2026, o número de lançamento fica fixo em `1` e a cor é o índice sequencial dentro da linha (gerado em `data.ts`, `collectionCounters`).
- `image` — `/products/{sku}.jpg`, arquivo estático em `app/public/products/`. Nem todo SKU tem foto real (ver seção Fotos de produto).
- Dois números de "margem" coexistem no card e **não são a mesma coisa** — não unificar:
  - **Badge verde "+X% sobre a fábrica"** (`pw-margintag`) — cálculo real `(pricePdv - priceFactory) / pricePdv`, quase constante entre produtos (a fórmula de PDV já embute ~39-40%). É regra de precificação, não estimativa.
  - **Badge cinza "Margem estimada X%"** (`badges`, de `raw[].marginPct`) — varia por SKU de propósito, é o que alimenta o filtro "Boa margem" do catálogo (`Number(label) >= 42`) e a copy "Margem estimada de X% no seu perfil de loja" na Ficha de Decisão.

### Carrinho → Pedido

Um `Carrinho` é compartilhado com o representante fixo da loja e pode ter **1+ `Pedido`s**, cada um com condição de pagamento, forma de pagamento e prazo de entrega próprios (confirmado em reunião real — não é 1 carrinho = 1 pedido). `GRADE_MINIMA_PARES = 36`: soma de `qty` de todos os itens de **um `Pedido`** (não do carrinho todo) precisa bater 36 pares, livremente distribuídos entre produtos/tamanhos — ver o aviso em `CarrinhoDetail.tsx` (bloqueia "Ir para pagamento" abaixo do mínimo) e em `OrderDrawer.tsx` (mesmo aviso, em tempo real, enquanto o lojista navega pelo Catálogo).

**`cartItems` → `Pedido` real (ago/2026):** o `OrderDrawer` (estado `cartItems`, "o pedido em construção") e `carrinhos` (Meus Carrinhos/CarrinhoDetail/Pagamento) eram dois modelos paralelos, sem ligação — "Ir para o carrinho" só navegava, não gerava nenhum `Pedido` de verdade. Resolvido:

- **`carrinhos` saiu de `lib/data.ts` e virou estado do zustand** (`useAppStore.carrinhos`, seed em `lib/data.ts` renomeado pra `initialCarrinhos`) — precisa ser mutável pra crescer quando um pedido é fechado. **Toda tela que lê carrinhos usa `useAppStore((s) => s.carrinhos)`, nunca mais importa `carrinhos` direto de `lib/data`** (`MeusCarrinhos`, `CarrinhoDetail`, `Payment`, `OrderConfirmed`, `Tracking`, `Chat`).
- **`commitCartToCarrinho(targetCarrinhoId)`** (`lib/store.ts`) — converte o `cartItems` atual num `Pedido` de verdade (`items` via `cartSummary`, `grade` derivada do miolo de `product.suggestedSizes`, `marginPct` calculado de PDV vs. fábrica, condição `'30'`/15 dias como padrão) e anexa no carrinho indicado por `targetCarrinhoId` (`null` = cria um carrinho novo, nome sequencial `Carrinho N`), depois **limpa o `cartItems`** — o drawer volta a representar "o próximo pedido", vazio, pronto pra montar de novo. Quem decide o `targetCarrinhoId` é sempre quem chama, nunca a função sozinha (ver botão abaixo). Retorna o id do carrinho de destino (ou `null` se o drawer estava vazio).
- **Botão do drawer virou "Adicionar ao carrinho"** (era "Ir para o carrinho") — e **decide o destino sozinho, sem perguntar** (`OrderDrawer.tsx`, `handleAddToCart`): usa o `activeCarrinhoId` se ele apontar pra um carrinho que ainda existe; senão, se só há 1 carrinho no total, usa esse; senão cria um novo. **Decisão de produto (ago/2026, revisitada no mesmo mês):** a primeira versão desse botão abria um seletor "em qual carrinho?" toda vez que havia 2+ carrinhos — voltamos atrás porque isso transforma um clique de compra numa decisão de organização, brigando com o papel que o drawer deveria ter (apoiar a navegação pelo catálogo e sugerir, não administrar carrinhos). Trade-off aceito: às vezes o pedido cai no carrinho "errado" — por isso o item abaixo.
- **`movePedidoToCarrinho(fromCarrinhoId, pedidoId, targetCarrinhoId)`** (`lib/store.ts`) — a correção pontual pro caso acima: tira um `Pedido` já existente de um carrinho e coloca em outro (ou num novo, `targetCarrinhoId: null`), renomeando `id`/`label` pra encaixar na sequência do destino. Acionado pelo link "Mover pedido" no cabeçalho de cada pedido em `CarrinhoDetail.tsx` — só aparece quando há outro carrinho pra mover (`otherCarrinhos.length > 0`) e o pedido ainda não foi pago (mover um pedido já confirmado não faz sentido). Abre o mesmo padrão de seletor (`WebModal` + `.optioncard`) que a v1 do botão do drawer usava, só que aqui — como é uma correção deliberada, não uma decisão em todo clique — o atrito faz sentido.
- **`activeCarrinhoId`** (zustand) continua sendo o "carrinho ativo" sugerido — decide o destino direto no drawer (sem seletor) e é a pré-seleção do seletor de mover pedido. Quem seta: **"+ Novo carrinho"** (em `MeusCarrinhos` e na aba de `CarrinhoDetail`) limpa pra `null`; **"Criar novo pedido neste carrinho"**, **"+ Adicionar N itens"** e **"Continuar comprando"** dentro de um `CarrinhoDetail` específico (`shopMoreForThisCarrinho()`) apontam pra aquele carrinho; `commitCartToCarrinho`/`movePedidoToCarrinho` também atualizam `activeCarrinhoId` pro carrinho que acabou de receber o pedido.
- **`getOrCreateCarrinho`** (privada, `lib/store.ts`) — "acha pelo id, ou cria um novo" compartilhado por `commitCartToCarrinho` e `movePedidoToCarrinho`, os dois pontos que decidem "em qual carrinho isso entra".
- **Bug de stacking corrigido nessa mudança** (ainda vale, mesmo com o seletor do drawer removido — o de mover pedido usa o mesmo `WebModal`): `.webmodal-scrim` tinha `z-index:30` e `position:absolute` — menor que `.order-drawer`/`.order-drawer-scrim` (`z-index:41`/`40`, `position:fixed`). Um `WebModal` aberto de dentro de um painel fixo (como o drawer) ficava visualmente por cima mas **inclicável**, porque o scrim do painel de baixo interceptava o clique. Corrigido pra `position:fixed;z-index:50` — acima de qualquer painel fixo da aplicação.
- **Ainda não mutado por essa mudança**: `Payment.tsx`/"Confirmar pedido" continua sem persistir `status: 'pago'`/condição/forma de pagamento escolhidas — é só navegação, mesmo comportamento de antes. Agora que `carrinhos` é estado real, dá pra fechar esse gap depois sem mudar a arquitetura de novo.

### Prazo de entrega

`deliveryEstimateDays` — prazo real confirmado com o cliente é **~15 dias corridos** (não 7, que era um chute anterior baseado em suposição errada). Casos pontuais de reposição rápida podem ser ~2 dias (ver o pedido de exemplo em `carrinhos.reposicao-rapida`). `0` é usado como valor-sentinela pra "entrega imediata" (à vista) — tratamento separado, não confundir com o caso de 2 dias.

### Bug corrigido: "Adicionar ao carrinho" clicava mas não mudava de estado (ago/2026)

O clique funcionava de verdade (o item ia pro `cartItems`, o drawer refletia certinho), mas o botão do próprio card continuava mostrando "Adicionar ao carrinho" em vez de virar "No carrinho" — em `ProductLineCard.tsx` e nas duas ocorrências em `Catalog.tsx` (Ficha de Decisão e o grid `?contexto=`). Causa: os três liam `const isInCart = useAppStore((s) => s.isInCart)` e depois chamavam `isInCart(p.id)` — mas `isInCart` é uma **função do store**, e a referência dessa função nunca muda entre atualizações do zustand. O seletor `(s) => s.isInCart` sempre retorna o mesmo valor, então o componente nunca era notificado quando `cartItems` mudava (mesmo o item tendo sido adicionado de verdade) — só re-renderizava por outro motivo (ex: trocar de cor no seletor de swatch).

Fix: os três agora selecionam `cartItems` direto (`const cartItems = useAppStore((s) => s.cartItems)`) e leem `Boolean(cartItems[p.id])` — esse sim é um valor que muda de referência a cada `set`, então o componente re-renderiza quando deveria. `isInCart` foi removido do store (ficava sem uso depois do fix, e é exatamente o padrão que causa esse bug — não recriar).

**Regra geral pra esse store**: nunca selecione uma *função* do zustand esperando reatividade (`useAppStore((s) => s.algumHelper)` + chamar o helper dentro do componente) — funções de store são estáveis por referência. Pra renderizar algo que depende de um pedaço do estado, selecione o próprio dado (`useAppStore((s) => s.cartItems)`, `useAppStore((s) => s.carrinhos)` etc.) e derive o valor no corpo do componente.

## Catálogo — cards agrupados por linha (mudança recente)

O grid do Catálogo (`Catalog.tsx`, view sem `?contexto=`) **não mostra mais um card por SKU** — agrupa por `collection` (`buildProductLines`) e renderiza um `ProductLineCard` por linha, com seletor de cor. A cor com maior `growthPct` da linha é a "mais vendida" (selo + estrela na miniatura), e é a selecionada por padrão ao abrir a página (ou a primeira cor que bate o filtro ativo, se a mais vendida não bater).

Filtros (`Alto giro`/`Boa margem`/`Lançamentos`/busca) continuam operando por SKU individual (`applyFilter`), mas a decisão de **mostrar ou não a linha inteira** é "pelo menos uma cor bate o critério" (`applyLineFilter`) — todas as cores continuam aparecendo no seletor mesmo com filtro ativo, só a seleção padrão muda.

**As views de contexto** (`?contexto=benchmark` e `?contexto=reposicao`, linkadas a partir do Radar) **continuam com o card antigo, um por SKU** (`contextConfig` em `Catalog.tsx`) — cada recomendação ali é sobre um produto específico (com badge de cobertura/sugestão de quantidade própria), então agrupar por linha perderia a informação. Não migrar essas views pro `ProductLineCard` sem repensar como cada anotação por-SKU se encaixaria numa linha.

A página da Linha Fusion (`Colecao.tsx`) usa o mesmo `ProductLineCard` (só 1 linha, sem grid).

### Filtro de preço, numeração, coleção + sem filtro selecionado por padrão (ago/2026)

- **`'Recomendado p/ você'` foi removido** dos chips de categoria — não fazia nenhuma filtragem de verdade (`applyFilter` não tinha um `if` pra esse valor, então já mostrava tudo) e vinha selecionado por padrão, o que passava a impressão de uma ordenação personalizada que não existe. Padrão agora é **`filter: null`**, nenhum chip de categoria selecionado, mostrando todas as linhas — igual ao comportamento de antes, só que honesto sobre o que está de fato acontecendo (subtítulo mudou de "ordenado por recomendado pra você" pra só `N linhas de produto`, com "· filtrado" quando algum filtro está ativo).
- **Chips de categoria (`Alto giro`/`Boa margem`/`Lançamentos`) agora deselecionam ao clicar de novo** (`setFilter(filter === f ? null : f)`) — antes era radio puro, sempre um selecionado; sem o `'Recomendado p/ você'` como "opção vazia", precisava de um jeito de voltar pra "nenhum filtro".
- **Novo filtro por preço** (`priceFilters` em `Catalog.tsx`): 3 baldes sobre `p.priceFactory` — `'Até R$250'`, `'R$250 – R$320'`, `'Acima de R$320'` (`matchesPriceFilter`). Cortes em R$250/R$320 são valores redondos escolhidos pela distribuição real do catálogo mock (R$145 a R$389,90, com bastante concentração entre R$260–300) — não é uma divisão perfeitamente equilibrada de SKUs, mas são números que o lojista reconhece de cabeça.
- **Preço combina com categoria via AND**, não substitui — `applyFilter`/`applyLineFilter` agora recebem `filter` e `priceFilter` como dois parâmetros independentes, cada um seu próprio chip-group (separados por um divisor vertical no `.filterbar`), mesmo padrão de toggle (clicar nulifica).
- **Views de contexto** (`?contexto=`) não ganharam filtro de preço nem numeração — elas já mostram uma lista curada e pequena (3-6 produtos específicos do insight do Radar), filtrar aí não agrega.
- **Novo filtro por numeração** (`sizeFilters`, `34`–`44`, `matchesSizeFilter`) — combina com categoria e preço via AND igual o preço. Renderizado como uma linha própria abaixo do `.filterbar` (reaproveita `.gradebox`/`.sizerow`/`.sizechip`, o mesmo componente visual já usado em "Grade sugerida" na Ficha de Decisão — só ganhou um modificador novo, `.sizechip.selected`, com fundo preto sólido pra não confundir com `.sizechip.on`, que significa "essa numeração está na grade sugerida do produto", um conceito diferente de "esse é o filtro ativo").
  - **Pré-requisito que não existia**: `suggestedSizes` (`buildSizes()` em `data.ts`) era **idêntico pra todo produto** (sempre 36–42) — um filtro de numeração contra isso seria decorativo (34/35/43/44 nunca bateriam em nada, 36-42 bateriam em tudo). `buildSizes` agora recebe o `sku` e varia a faixa sugerida de forma determinística por produto (hash simples do SKU): um núcleo 37–40 sempre coberto, pontas (até 34 de um lado, até 44 do outro) variando por SKU — dado **ilustrativo**, não confirmado pelo cliente, existe só pra dar variação real ao filtro (mesmo racional de `samePeriodLastYearQty`/`previousCollectionQty` antes dele). Efeito colateral bem-vindo: a "Grade sugerida" na Ficha de Decisão, que antes mostrava sempre 36–42 pra qualquer produto, agora varia de verdade também.
- **Novo filtro por coleção** (`collectionFilters`, gerado de `Object.keys(collectionTitle)` — mesma fonte de nome de exibição usada no resto do app) — pedido explícito pensando em quando o catálogo tiver mais coleções além das 7 atuais (hoje o grid já agrupa visualmente por linha, então o filtro é redundante enquanto são poucas, mas some de ser em quantidade). Mesmo padrão de toggle e mesma linha própria abaixo do `.filterbar` que a numeração, só que com `.chip` (pílula de texto) em vez de `.sizechip` (caixa numérica) — `collection` é texto, não teria sentido usar o componente de grade.

`buildProductLines` foi extraído pra `lib/productLines.ts` (também exporta `deltaInfo`) porque é usado pelo Catálogo e pela Coleção Fusion; `deltaInfo` sozinho também é usado por `CarrinhoDetail.tsx` — ver seção seguinte.

### Filtro "Oportunidade perdida" + benchmark/reposição viram chips do grid (ago/2026)

- **`'Oportunidade perdida'` entrou em `categoryFilters`** — usa um dado que já existia (`p.badges.some(b => b.label === 'Oportunidade perdida')`, o mesmo badge que já aparecia solto no card e alimentava as sugestões do `OrderDrawer`) só que agora também dá pra filtrar por ele direto no Catálogo. É o tipo de filtro "inteligente" que ajuda de verdade na escolha — mostra o que a loja ainda não vende — sem precisar inventar dado novo. Hoje só 2 SKUs têm esse badge no mock (`1901-16`, `2101-31`), então o resultado filtrado é bem pequeno — isso é o dado real, não um bug.
- **`?contexto=benchmark` e `?contexto=reposicao` ganharam entrada direto no `.filterbar`** — antes só eram alcançáveis clicando num CTA específico do Radar; agora também aparecem como chips (`Benchmark: lojas parecidas` / `Reposição necessária`) na mesma fileira dos outros filtros do Catálogo, depois de um segundo divisor. Clicar seta `searchParams.set('contexto', key)` — **é o mesmo mecanismo de sempre**, reaproveita 100% do banner/card/badge que a view de contexto já tinha (não foi reescrito, só ganhou mais um jeito de entrar). Os CTAs antigos no Radar continuam funcionando iguais, isso foi só um caminho novo, não uma migração.
- Como antes, os filtros de categoria/preço/numeração/coleção não se aplicam dentro de uma view de contexto (ela já é uma lista curada e pequena) — nada mudou nessa regra.
- **Tooltip em cada chip que tem critério não-óbvio** (`title`, mesmo atributo nativo já usado em `WebTopNav`/`ProductLineCard`, não é um componente novo): categoria (`categoryFilterTooltips`), preço (`priceFilterTooltip`, explica que é preço de fábrica, não PDV) e os dois chips de contexto (`contextFilterTooltips`). Numeração/coleção não ganharam — o rótulo já é autoexplicativo (um número, um nome de linha), tooltip ali só teria sido ruído.

### Combos sugeridos (ago/2026)

Seção nova no Catálogo, abaixo do grid principal — cards com **dois produtos** e um preço combinado com desconto. **Contexto importante**: combos estão marcados como fora do MVP em `docs/cruzamento-reuniao-cliente.md` ("evolução futura, não requisito desta fase") — o cliente pediu pra simular mesmo assim dentro do protótipo, como vantagem de venda pra próxima fase. Não é uma reversão silenciosa da decisão: está anotado nos dois docs.

- **Modelo de dado novo**: `Combo` (`lib/types.ts`) — `{ id, productIds: [string, string], discountPct, reason, reasonTone }`. `combos: Combo[]` (`lib/data.ts`) tem 2 combos curados à mão (não é um algoritmo de recomendação de verdade):
  - `combo-1` — Flow XL Black (`2502-17`, o único SKU com `riskCallout` de estoque parado que também tem foto real) + Hertz Black Gold (`2101-25`, mais vendida), 10% off, `reasonTone: 'clear'`. É a mesma lógica de negócio do "Destaque da semana" do Radar — "produto parado → oferta direcionada" — só que virando um combo em vez de um banner solto.
  - `combo-2` — Coil Denim (`1901-66`) + Flow XL Purple (`2502-21`), duas linhas de alto crescimento sem relação de negócio simulada além de "as duas vendem bem", 8% off, `reasonTone: 'pair'` ("comprados juntos com frequência" — em produção viria de dado de coocorrência entre pedidos, que ainda não existe).
- **`comboPrice(combo, products)`** (`lib/productLines.ts`) — sempre calcula a partir do `priceFactory` de cada produto (nunca um valor fixo à parte): `sumFactory = p1.priceFactory + p2.priceFactory`, `finalPrice = sumFactory × (1 − discountPct/100)`. Devolve `null` se algum `productId` do combo não existir (guarda de segurança, não deveria acontecer com os combos mock).
- **Correção de rota importante (pedido explícito do usuário depois de ver a v1 funcionando)**: a primeira versão do botão "Adicionar combo ao carrinho" chamava `addToCart(p1.id, 12)` + `addToCart(p2.id, 12)` — ou seja, jogava os dois produtos em `cartItems` **a preço cheio individual**, sem nenhum desconto de verdade (o card mostrava "R$459,00" mas o pedido cobrava R$510,00 mesmo). O ponto levantado: **um combo tem preço promocional, então é um item único no carrinho — não dois produtos separados**. Corrigido com um pool de carrinho própria pra combos:
  - **`cartCombos: Record<comboId, number>`** no store (zustand) — `1` = combo presente, ausente = não (sem stepper de quantidade ainda, só toggle). `toggleCombo`/`removeCombo` (mesmo padrão de `toggleCart`/`removeFromCart`, mas numa pool separada).
  - **`comboSummary(cartCombos)`** (`lib/store.ts`, mesma forma de retorno que `cartSummary`) resolve `cartCombos` em linhas de verdade via `comboPrice`, soma pares (`COMBO_PARES_PER_PRODUCT = 12` por produto, 24 no total) e valor (`finalPrice`, já com desconto).
  - **`OrderDrawer.tsx`** agora soma `cartSummary(cartItems)` + `comboSummary(cartCombos)` pro total do header/grade mínima, e renderiza os combos como linhas próprias em `.sidebar-itemlist` (nome "Combo: X + Y", "24 pares · R$459,00 (−10%)"), com o mesmo "x" de remover que os itens normais têm (chama `removeCombo`, não `removeFromCart`).
  - **`commitCartToCarrinho`** (o que transforma o drawer num `Pedido` de verdade — ver seção "Carrinho → Pedido") agora também lê `cartCombos` e gera, pra cada combo, **um único `PedidoItem` sintético**: `productId` = o id do combo (ex: `'combo-1'`, não um SKU real), `name` = `"Combo: A + B"`, `qty` = 24, `grade` = `'—'`, `value` = o preço já com desconto. É assim que "preço promocional = item único" se traduz pro modelo de `Pedido` existente, sem precisar de campo novo em `PedidoItem` nem mexer em `CarrinhoDetail.tsx`/`Payment.tsx` (que já iteram `pedido.items` genericamente). `cartCombos` é limpo no commit, igual `cartItems`.
  - **Efeito colateral correto, não um bug**: a comparação "Antes de fechar" em `CarrinhoDetail.tsx` (`samePeriodLastYearQty[item.productId]`) simplesmente não encontra dado pro id sintético do combo e o exclui da comparação — não tem "ano passado" pra um combo que não existia, então é certo ele não aparecer ali.
  - Grade mínima (`GRADE_MINIMA_PARES`) já soma certo sem nenhum código especial, porque conta `item.qty` de todos os itens do pedido — e o combo já chega como 1 item com `qty: 24`.
- **CSS novo** (`mockup.css`): `.combogrid`/`.combocard`/`.combo-reason`/`.combo-products`/`.combo-p`/`.combo-plus`/`.combo-pricing`/`.combo-was`/`.combo-now`/`.combo-save` — reaproveita `.pw-thumb`/`.pw-addbtn` de dentro desses containers (o botão "Adicionar combo ao carrinho" é literalmente um `.pw-addbtn` normal, só que chamando `toggleCombo` em vez de `toggleCart`).
- **Não implementado de propósito**: quantidade ajustável por combo (hoje é 0 ou 1, sem stepper), e o combo não aparece em `CarrinhoDetail`/`Payment` como "2 produtos" separados em nenhuma tela — é sempre 1 linha, do drawer até o pedido confirmado.

## Planejar virou parte do fechamento do carrinho, não uma tela solta (ago/2026)

**Histórico**: existiu uma tela `Planning.tsx` (rota `/planejamento`) — primeiro com uma barra de mix por %, depois redesenhada pra comparar cada linha do catálogo com uma "coleção anterior" importada via CSV, com o mesmo `cartItems` do Catálogo por trás (as duas rodadas anteriores desse redesign estão só no histórico do git; esta seção documenta o estado atual). Mesmo depois de corrigir a integração de estado, o usuário continuou sem entender por que a tela deveria existir: ela ainda abria com um banner focado em "coleção" (não no pedido que o lojista estava montando), e não tinha nenhum gatilho — era um item de menu permanente que dependia do lojista lembrar de visitar por conta própria, sem relação clara com o resto do fluxo.

**Decisão**: tirar a comparação da nav e dobrá-la pra dentro do momento em que ela já faz sentido — o checklist **"Antes de fechar"** que já existia em `CarrinhoDetail.tsx` (hoje com o item "Mix balanceado entre categorias"). Junto, a base de comparação mudou de "coleção anterior" (exigia import manual de planilha) pra **"mesmo período do ano passado"** — dado que o próprio Pace Seller já tem (é a compra da própria loja, feita por aqui), sem import, sem estado vazio pra tratar.

- **`Planning.tsx` foi deletada**, junto com a rota `/planejamento`, o item de nav ("Planejar o pedido" no `WebTopNav`, "Planejar" no `AppShell`), o fluxo de import CSV (`UploadModal`) e o estado `previousCollectionStatus`/`importPreviousCollection`/`skipPreviousCollection`/`resetPreviousCollection` no zustand store — nada disso faz sentido sem uma tela pra hospedar.
- **`ProductLineCard`** voltou a ser só o card do Catálogo — perdeu a prop `planning` (e o `.pw-compare`/stepper que só existiam pra ela). Não sobrou nenhum outro consumidor além do Catálogo/Coleção Fusion.
- **Novo dado mock**: `samePeriodLastYearQty` (`data.ts`) — `Record<productId, qty>`, substitui `previousCollectionQty`/`previousCollectionName` (removidos). Granularidade mudou de por-`collection` pra por-SKU, porque agora compara direto com os itens reais do carrinho (`PedidoItem.productId`), não com uma linha inteira. Cobre só os SKUs que aparecem nos carrinhos mock hoje (`2101-30`, `1901-67`, `2101-31`); SKU sem entrada = sem dado histórico, e o item correspondente simplesmente não entra na comparação — sem estado vazio, sem pedir import.
- **`CarrinhoDetail.tsx`**: agrupa os itens de todos os pedidos **ainda não pagos** do carrinho (`pedido.status !== 'pago'` — um pedido já fechado não tem por que ser requestionado "antes de fechar"), filtra pelos SKUs com `samePeriodLastYearQty` e renderiza um item a mais no `.qualitybox`, "Comparado ao mesmo período do ano passado", com uma linha por produto (`.yoylist`/`.yoyrow`) mostrando `ano passado X pares` → `Y pares · ±Z%` (reaproveita `deltaInfo` e o badge `.deltabadge` que a antiga tela Planejar já usava). Se nenhum item do carrinho tem dado histórico (ou todos os pedidos já estão pagos), o item do checklist simplesmente não aparece.
- **Pontos de entrada atualizados** pra não apontar mais pra uma rota morta:
  - Radar → card "Feche seu pedido com o histórico em mãos" (`ins-10` em `data.ts`) agora tem `cta: 'Ver carrinhos'` → `/carrinhos`, e o texto fala em "mesmo período do ano passado" em vez de "coleção anterior".
  - Radar → banner "Destaque da semana": botão virou "Ver no catálogo" → `/catalogo` (a comparação em si só aparece depois, no fechamento do carrinho, não faz sentido prometê-la aqui).
  - Catálogo → Ficha de Decisão: o segundo botão ("Planejar pedido", que levava pra `/planejamento`) foi removido — sobrou só "Adicionar ao carrinho", com uma linha de apoio avisando que a comparação com ano passado aparece "antes de fechar" o carrinho.
- **`mixPlan`** (em `data.ts`) continua intocado — só é usado por `screens/representante/SuggestedOrder.tsx` (fluxo mobile do representante, fora de escopo aqui).
- **Por que a comparação lê `cart.pedidos` e não `cartItems` direto**: a comparação em `CarrinhoDetail.tsx` é sobre o(s) `Pedido`(s) já dentro *deste* carrinho, não sobre o que o lojista está montando agora no drawer — são momentos diferentes (o pedido em construção só entra em `cart.pedidos` quando o drawer é fechado, ver `commitCartToCarrinho` na seção "Carrinho → Pedido" acima).

## OrderDrawer — "Seu pedido" virou um drawer global (ago/2026)

Antes, "Seu pedido" era o componente `OrderSidebar`, uma coluna fixa de 320px sempre visível ao lado do conteúdo — só existia dentro do Catálogo e da página da Linha Fusion (`Colecao.tsx`), cada um passando seus próprios `nudges` customizados via prop. O usuário achou que merecia mais destaque justo por ser sempre a mesma faixa estreita ocupando espaço, e pediu pra virar algo que abre/fecha, como um menu — esboçado como Artifact antes de mexer no código real.

- **`OrderDrawer.tsx`** (`components/desktop/`) substituiu `OrderSidebar.tsx`. Não recebe mais props (`nudges`/`mixPct` foram removidas) — lê tudo direto do zustand (`cartItems`, `orderDrawerOpen`) e do catálogo (`products`), porque agora é **montado uma única vez, globalmente**, em `DesktopPage.tsx` (o wrapper usado por toda tela do lojista desktop) em vez de ser inserido manualmente em cada tela.
- **Trigger**: ícone de sacola em `WebTopNav.tsx` (`.navicon`, ao lado da busca e do sino), com `onClick={toggleOrderDrawer}`. **De propósito não mostra contagem nem valor** — o usuário pediu pra tirar isso porque o módulo de carrinho vai ter múltiplos carrinhos, e um número solto no ícone ia parecer "o total" quando na real seria só o rascunho atual. Os números completos (itens, valor, margem) só aparecem dentro do drawer já aberto.
- **Mecânica**: `orderDrawerOpen` no store controla duas classes CSS (`.order-drawer.open` desliza o painel da direita via `transform`, `.order-drawer-scrim.open` escurece o fundo) — mesmo padrão visual do `WebModal`, mas com slide em vez de fade+scale, e não reaproveita `.web-sidebar` (que continua existindo pro resumo do carrinho em `CarrinhoDetail.tsx` — são propositalmente CSS separados, ver `.order-drawer` vs `.web-sidebar` em `mockup.css`).
- **Como abrir/fechar pontos de entrada antigos**: Catálogo/Ficha de Decisão/Coleção Fusion não montam mais `OrderSidebar` nenhum — o layout de 2 colunas virou 1 coluna full-width nessas telas (a `.web-sidebar` sumiu do `.web-app-layout`, `.web-content{flex:1}` ocupa o espaço todo automaticamente).
- **Botão "Planejar compra" foi removido do drawer** (pedido explícito) — só sobrou "Ir para o carrinho". A comparação com o histórico da loja não vive mais atrás de um botão de planejamento — ela aparece sozinha no checklist "Antes de fechar" quando o lojista chega no `CarrinhoDetail`.
- **Sugestões pra completar o mix**: nova seção dentro do drawer, lista produtos com badge "Oportunidade perdida" (loja ainda não vende) que ainda não estão no `cartItems`, com botão "+" que chama `addToCart(id, 12)` direto — soma real ao pedido em construção, atualiza a lista (o item sai das sugestões assim que entra no carrinho) e o total no topo do drawer, tudo em tempo real.
  - **Bug corrigido nessa mudança**: o badge "Oportunidade perdida" (`data.ts`) era aplicado pra **qualquer** `riskCallout`, mas o texto do dado mock tinha dois sentidos diferentes — "loja ainda não vende este modelo" (oportunidade de entrada) vs. "sem giro nos últimos 30 dias" (item parado que já está no mix). Antes disso não importava muito (o badge só aparecia no card), mas como a lista de sugestões passou a **filtrar por esse badge**, o texto errado faria um item parado (Flow XL Black) aparecer como "sua loja ainda não vende" — agora o label vira "Estoque parado" nesse caso.
- **`WebTopNav`**: o item de menu "Pedidos" (que levava pra `/carrinhos`) virou **"Meus carrinhos"** — é como a própria tela já se chamava (título e breadcrumb já usavam esse nome; só o link do menu estava desalinhado). Decisão de manter texto em vez de um segundo ícone de carrinho: já que o ícone de sacola do drawer ocupa esse papel visual no header, um ícone de carrinho ali pros pedidos **já enviados** ia confundir rascunho-em-construção com histórico de compras fechadas.

## Fotos de produto

Extraídas dos catálogos PDF reais da Tesla Footwear (não são geradas/fake). Cobertura hoje: COIL, HERTZ, HERTZ ART (parcial), FLOW, FLOW XL. **Fusion e TG II não têm foto real** (não aparecem nos PDFs recebidos) — nesses casos `ProductThumb` cai automaticamente no ícone placeholder via `onError`, então nunca vai aparecer imagem quebrada, mas também não adianta tentar "consertar" apontando pra um arquivo que não existe.

**Padronizadas pra um mesmo tamanho (ago/2026):** os 33 arquivos em `app/public/products/` vinham direto do recorte de cada PDF, com enquadramentos bem diferentes entre si — de 448×249 a 900×900px, algumas já cortadas rente ao tênis, outras com bastante margem sobrando. Mesmo o `ProductThumb` usando `object-fit:contain` (que evita distorcer qualquer imagem), o **tênis em si** aparecia em escalas bem diferentes de um card pro outro, porque o "zoom" já vinha embutido no arquivo. Corrigido reprocessando os 33 arquivos (script Python ad-hoc, não faz parte do build — não precisa rodar de novo a menos que cheguem fotos novas):

1. Detecta a bounding box do conteúdo real (tênis) em cada imagem — qualquer pixel com `min(R,G,B) < 228` conta como conteúdo, o resto é fundo (todas as fotos são still de estúdio em fundo branco/quase-branco, algumas com um vinheta bem sutil nos cantos — o threshold absoluto de branco lida bem com isso; a primeira tentativa, comparar cada pixel com uma amostra dos 4 cantos, se enganava nessas fotos com vinheta e "achava" conteúdo na imagem inteira).
2. Recorta pra essa bounding box, redimensiona preservando a proporção pra ocupar **82% da largura** de uma tela final fixa de **900×520px**, e centraliza em fundo branco.

Resultado: todo arquivo em `products/` tem exatamente 900×520px hoje, e o tênis ocupa uma fração visualmente parecida do quadro em qualquer card (Catálogo, Ficha de Decisão, drawer, etc.) — sem precisar mexer no `ProductThumb` ou em nenhum CSS, o ganho é só no arquivo de origem. Se uma foto nova for adicionada depois, vale rodar o mesmo tratamento nela antes de soltar no diretório (senão ela vai destoar de novo).

## Fora de escopo — propositalmente não implementado

Ver `docs/cruzamento-reuniao-cliente.md` pro racional completo. Resumo do que **não** deve ser desenhado/implementado sem retomar a decisão com o cliente:

- **Categoria de cliente 3/6/9** (filtro de catálogo por perfil de lojista) — decisão explícita do cliente de adiar. Não existe em nenhum lugar do código hoje; se aparecer um pedido pra "mostrar só produtos disponíveis pro perfil do lojista", é sobre isso, e está fora de escopo.
- **Condição de pagamento livre** — hoje `Payment.tsx` mostra 30/60/90 e à vista como se fossem sempre todas disponíveis. Na regra real, a condição é liberada por cliente (histórico de pontualidade). Marcado como correção de comportamento não-urgente, ainda não implementada.
- **Onde roda a aprovação de crédito** — em aberto pelo próprio cliente (dentro do Pace Seller ou no sistema atual dele). O mockup assume que a aprovação do representante é só um "ok" dentro do `CarrinhoDetail`, sem etapa de crédito separada.
- Combos, controle de revenda em marketplace terceiro, preço diferenciado por perfil, expansão internacional — confirmado fora do MVP.

## Direções futuras mapeadas (não esboçadas, não implementadas)

Diferente da seção acima (decisões que o cliente pediu pra adiar), isto aqui é product roadmap do usuário — vale saber que existe, mas não é pra puxar implementação nem esboço sem pedido explícito:

- **Módulo de campanha (criação de cards pra Instagram/WhatsApp)** — gerar peça de divulgação pronta pra produtos que precisam de empurrão de marketing. Mencionado como o próximo passo natural do card "Baixo giro" que existe hoje em `lojistaRadarInsights` (`ins-11`, Radar → grupo "Nos próximos 30 dias") — hoje esse card só linka pra Ficha de Decisão do produto porque não existe nenhuma tela de campanha ainda. Quando isso for retomado, esse é o ponto de entrada natural (o CTA do card provavelmente muda de "Ver produto" pra algo como "Criar campanha").

## Regras de negócio confirmadas (não são chute)

- Grade de numeração: 34 a 44 (`buildSizes()` em `data.ts`).
- Preço fábrica/PDV, grade mínima de 36 pares, referência de produto (formato Linha-Ano-Lançamento-Cor), prazo de ~15 dias: todos confirmados em reunião real com o cliente — ver `docs/cruzamento-reuniao-cliente.md`.
