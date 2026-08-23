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
- No `.cta` do Radar, como cada instância também definia `marginTop: 10` inline via `style` (React), isso tinha prioridade sobre a classe CSS — foi removido do inline e adicionado um `padding-top:10px` fixo na classe `.cta` (junto do `margin-top:auto`), garantindo espaçamento mínimo mesmo quando o card é o mais alto da fileira e a margem automática vira 0.

**Padrão a seguir em novos grids de card**: se o card tem um botão/link de ação no fim e o conteúdo acima varia de tamanho, usar essa combinação (flex column no container + `flex:1` no corpo + `margin-top:auto` no elemento de ação), em vez de `margin-top` fixo em px.

## Componentes compartilhados (`components/desktop/`)

| Componente | Uso |
|---|---|
| `DesktopPage` | wrapper de página (fundo, min-height) |
| `WebTopNav` | navbar superior com menu do avatar |
| `Breadcrumb` | trilha de navegação abaixo da navbar |
| `OrderSidebar` | painel lateral "Seu pedido" (Catálogo/Planejamento) — mostra itens do `cartItems` do store, nudge de grade mínima e de mix |
| `ProductThumb` | `<img>` de produto com fallback automático pro ícone placeholder (SVG de tênis) via `onError`, caso o SKU não tenha foto real ainda |
| `ProductLineCard` | card de produto **agrupado por linha** (ex: as 10 cores de Coil), com seletor de cor (miniaturas clicáveis) e selo "★ Mais vendida" na cor de maior `growthPct`. É o card usado no Catálogo e na página da Linha Fusion — ver seção Catálogo abaixo |
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

Um `Carrinho` é compartilhado com o representante fixo da loja e pode ter **1+ `Pedido`s**, cada um com condição de pagamento, forma de pagamento e prazo de entrega próprios (confirmado em reunião real — não é 1 carrinho = 1 pedido). `GRADE_MINIMA_PARES = 36`: soma de `qty` de todos os itens de **um `Pedido`** (não do carrinho todo) precisa bater 36 pares, livremente distribuídos entre produtos/tamanhos — ver o aviso em `CarrinhoDetail.tsx` (bloqueia "Ir para pagamento" abaixo do mínimo) e em `OrderSidebar.tsx` (mesmo aviso, em tempo real, enquanto ainda está no Catálogo/Planejamento).

**Gap conhecido:** `OrderSidebar` (estado `cartItems` do zustand, usado durante a navegação pelo Catálogo) e `carrinhos` (dado mock usado em Meus Carrinhos/Carrinho/Pagamento) **não são a mesma fonte de dados** — são dois modelos paralelos que ainda não foram unificados. "Ir para o carrinho" na sidebar não gera de fato um novo `Pedido` a partir do `cartItems`.

### Prazo de entrega

`deliveryEstimateDays` — prazo real confirmado com o cliente é **~15 dias corridos** (não 7, que era um chute anterior baseado em suposição errada). Casos pontuais de reposição rápida podem ser ~2 dias (ver o pedido de exemplo em `carrinhos.reposicao-rapida`). `0` é usado como valor-sentinela pra "entrega imediata" (à vista) — tratamento separado, não confundir com o caso de 2 dias.

## Catálogo — cards agrupados por linha (mudança recente)

O grid do Catálogo (`Catalog.tsx`, view sem `?contexto=`) **não mostra mais um card por SKU** — agrupa por `collection` (`buildProductLines`) e renderiza um `ProductLineCard` por linha, com seletor de cor. A cor com maior `growthPct` da linha é a "mais vendida" (selo + estrela na miniatura), e é a selecionada por padrão ao abrir a página (ou a primeira cor que bate o filtro ativo, se a mais vendida não bater).

Filtros (`Alto giro`/`Boa margem`/`Lançamentos`/busca) continuam operando por SKU individual (`applyFilter`), mas a decisão de **mostrar ou não a linha inteira** é "pelo menos uma cor bate o critério" (`applyLineFilter`) — todas as cores continuam aparecendo no seletor mesmo com filtro ativo, só a seleção padrão muda.

**As views de contexto** (`?contexto=benchmark` e `?contexto=reposicao`, linkadas a partir do Radar) **continuam com o card antigo, um por SKU** (`contextConfig` em `Catalog.tsx`) — cada recomendação ali é sobre um produto específico (com badge de cobertura/sugestão de quantidade própria), então agrupar por linha perderia a informação. Não migrar essas views pro `ProductLineCard` sem repensar como cada anotação por-SKU se encaixaria numa linha.

A página da Linha Fusion (`Colecao.tsx`) usa o mesmo `ProductLineCard` (só 1 linha, sem grid).

## Fotos de produto

Extraídas dos catálogos PDF reais da Tesla Footwear (não são geradas/fake). Cobertura hoje: COIL, HERTZ, HERTZ ART (parcial), FLOW, FLOW XL. **Fusion e TG II não têm foto real** (não aparecem nos PDFs recebidos) — nesses casos `ProductThumb` cai automaticamente no ícone placeholder via `onError`, então nunca vai aparecer imagem quebrada, mas também não adianta tentar "consertar" apontando pra um arquivo que não existe.

## Fora de escopo — propositalmente não implementado

Ver `docs/cruzamento-reuniao-cliente.md` pro racional completo. Resumo do que **não** deve ser desenhado/implementado sem retomar a decisão com o cliente:

- **Categoria de cliente 3/6/9** (filtro de catálogo por perfil de lojista) — decisão explícita do cliente de adiar. Não existe em nenhum lugar do código hoje; se aparecer um pedido pra "mostrar só produtos disponíveis pro perfil do lojista", é sobre isso, e está fora de escopo.
- **Condição de pagamento livre** — hoje `Payment.tsx` mostra 30/60/90 e à vista como se fossem sempre todas disponíveis. Na regra real, a condição é liberada por cliente (histórico de pontualidade). Marcado como correção de comportamento não-urgente, ainda não implementada.
- **Onde roda a aprovação de crédito** — em aberto pelo próprio cliente (dentro do Pace Seller ou no sistema atual dele). O mockup assume que a aprovação do representante é só um "ok" dentro do `CarrinhoDetail`, sem etapa de crédito separada.
- **Módulo "Planejar" (`Planning.tsx`)** — sob revisão. A tela atual mistura uma barra de mix por linha (%) que não tem ligação com a lista de itens embaixo dela, mais um modal "Ajustar mix" que não afeta nada — o cliente achou confuso. Direção proposta (ainda não implementada): virar uma funcionalidade dentro do Catálogo, comparando quantidade da coleção anterior com o planejamento atual, linha por linha. Ver esboço interativo publicado como Artifact na sessão — se for retomado, checar com o usuário antes de mexer na tela atual.
- Combos, controle de revenda em marketplace terceiro, preço diferenciado por perfil, expansão internacional — confirmado fora do MVP.

## Regras de negócio confirmadas (não são chute)

- Grade de numeração: 34 a 44 (`buildSizes()` em `data.ts`).
- Preço fábrica/PDV, grade mínima de 36 pares, referência de produto (formato Linha-Ano-Lançamento-Cor), prazo de ~15 dias: todos confirmados em reunião real com o cliente — ver `docs/cruzamento-reuniao-cliente.md`.
