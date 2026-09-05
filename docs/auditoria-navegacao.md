# Auditoria de Navegação — Perfil Lojista Desktop

> Todo botão clicável do que já construímos, com o destino atual e o que falta. Objetivo: nenhum botão "morto" — cada um leva a algum lugar (outra tela) ou faz algo na própria tela (e isso precisa estar visualmente claro).

**Legenda:** ✅ resolvido · 🔴 beco sem saída (tela de destino não existe) · 🟡 comportamento ambíguo (não está claro se é a mesma tela ou navega) · ⚪ fora do escopo desta fase (já sinalizado nos documentos anteriores)

---

## 0.1 Seleção de Perfil
| Botão | Destino hoje | Status |
|---|---|---|
| "Sou lojista" | 0.2 Login Lojista | ✅ |
| "Sou representante" | — | ⚪ (representante desktop ainda não desenhado) |
| "Fale com a indústria" | — | 🔴 sem destino nem comportamento definido |

## 0.2 Login — Lojista
| Botão | Destino hoje | Status |
|---|---|---|
| "Esqueci minha senha" | 0.2a Recuperar Senha | ✅ |
| "Entrar" | Radar **ou** Onboarding, dependendo do perfil | 🟡 a lógica existe no documento de fluxo, mas **a tela não mostra visualmente que essa bifurcação existe** — quem olha o layout não sabe que há dois caminhos possíveis |
| "Entrar com Google" | — | ⚪ (OAuth, fora do escopo) |
| "É representante? Entrar aqui" | — | ⚪ (representante desktop ainda não desenhado) |

## 0.2a / 0.2b Recuperação de Senha
| Botão | Destino hoje | Status |
|---|---|---|
| "Enviar link de recuperação" | 0.2b Confirmação | ✅ |
| "Voltar para o login" (nas duas telas) | 0.2 Login | ✅ |
| "Reenviar e-mail" | mesma tela | ✅ (ação inline, correto) |

## 1–3 Onboarding (Perfil da Loja)
| Botão | Destino hoje | Status |
|---|---|---|
| "Pular por agora" (etapa 1) | — | 🟡 pula pra etapa 2? Ou pula o onboarding inteiro e vai pro Radar (estado vazio)? **A tela não deixa isso claro** |
| "Continuar" (etapas 1 e 2) | próxima etapa | ✅ |
| "Voltar" (etapa 2) | etapa anterior | ✅ |
| "Conectar meu sistema de vendas" | — | ⚪ (integração externa, fora do escopo) |
| "Ir para o meu radar" (etapa 3) | 4 Radar Comercial | ✅ |

## 4 Radar Comercial
| Botão | Destino hoje | Status |
|---|---|---|
| Avatar (canto superior direito) | 4.2 Menu do avatar | ✅ |
| "Ajustar foco" | — | 🔴 **não existe modal desktop** (só construí essa peça pra tablet) |
| Card Oportunidade → "Ver produto" | 7.2 Ficha de Decisão | ✅ |
| Card Estoque baixo → "Repor agora" | toast inline, sem navegar | ✅ (correto, decisão que já validamos) |
| Card Benchmark → "Comparar" | 6.2 Catálogo filtrado | ✅ |
| Card Lançamento → "Ver coleção" | 6.3 Página da Coleção | ✅ **resolvido** |
| Tile "Reposição necessária" | 4.5 Modal de lista | ✅ |
| Tile "Lançamentos" | — | 🔴 mesmo modal, conteúdo não construído |
| Tile "Produtos em alta" | — | 🔴 mesmo modal, conteúdo não construído |
| Tile "Alertas" | — | 🔴 mesmo modal, conteúdo não construído |
| Bloco "Destaque da semana" → "Adicionar ao planejamento" | — | 🔴 Planejamento não existe em desktop |
| TopNav: Catálogo | 6 Catálogo | ✅ |
| TopNav: Planejar / Pedidos / Clientes | — | ⚪ já sinalizado como fora desta leva |

## 4.3 Radar — Estado Vazio
| Botão | Destino hoje | Status |
|---|---|---|
| "Completar meu perfil" | — | 🟡 deveria voltar pro onboarding, mas em qual etapa? Não está definido |
| "Ver catálogo" | 6 Catálogo (presumido) | 🟡 nunca testei se a seta realmente aponta pra lá |
| "Ver contato" | — | ⚪ (representante, fora do escopo) |

## 4.5 Modal — Reposição Necessária
| Botão | Destino hoje | Status |
|---|---|---|
| "Repor" (por item) | inline, item muda de estado | ✅ |
| "Repor todos" | — | 🟡 deveria fechar o modal + mostrar toast, igual ao "Repor agora" do card — não construí esse retorno |
| "Ver tudo no catálogo" | — | 🔴 catálogo filtrado por "reposição" não existe (só existe o filtro de benchmark) |

## 6 Catálogo Inteligente — Listagem / 6.2 Filtrado por Benchmark
| Botão | Destino hoje | Status |
|---|---|---|
| "Adicionar ao carrinho" (nos cards) | inline, sem navegar | ✅ (correto, decisão já validada) |
| Clicar no nome/imagem do produto | 7 Ficha de Decisão | ✅ |
| Remover item (sidebar) | inline | ✅ |
| "Ir para o carrinho" (sidebar) | 10 Carrinho | ✅ **resolvido** |
| "Planejar compra" (sidebar) | — | 🔴 Planejamento ainda não existe (próximo da fila) |
| "Limpar filtro" (6.2) | 6 Catálogo sem filtro | ✅ (implícito, comportamento óbvio) |

## 7 / 7.2 Ficha de Decisão
| Botão | Destino hoje | Status |
|---|---|---|
| "Adicionar ao carrinho" | adiciona + navega pra 10 Carrinho | ✅ **resolvido** — decisão explícita do produto merece revisão no carrinho, diferente do quick-add do catálogo |
| "Adicionar ao planejamento" | — | 🔴 Planejamento ainda não existe |
| "Ir para o carrinho" / "Planejar compra" (sidebar) | Carrinho ✅ / Planejamento 🔴 | parcialmente resolvido |

## 9 Meus Pedidos (nova) / 10 Carrinho (nova)
| Botão | Destino hoje | Status |
|---|---|---|
| "Criar novo pedido" (Meus Pedidos) | 6 Catálogo | ✅ |
| "Abrir" (cada pedido da lista) | 10 Carrinho daquele pedido | ✅ |
| Tabs do cartswitcher (Carrinho) | troca o pedido ativo, mesma tela | ✅ |
| "+ Novo pedido" (tab) | 6 Catálogo | ✅ |
| "Ir para pagamento" | — | 🔴 Pagamento ainda não existe em desktop (próximo depois do Planejamento) |
| "Enviar para Ana aprovar" | inline (status muda, toast) | 🟡 comportamento pretendido, ainda não construí o toast de confirmação aqui |
| "Salvar como rascunho" | inline (volta pra Meus Pedidos com status rascunho) | 🟡 mesma observação |
| "← Continuar comprando" | 6 Catálogo | ✅ |

---

## O que isso mostra, resumido

**Atualização:** Meus Pedidos e Carrinho foram construídos — isso fechou 3 becos sem saída (Ir para o carrinho, Adicionar ao carrinho em 2 lugares) e criou a etapa de "clímax" da narrativa que estava faltando.

**O que ainda falta, em ordem de prioridade:**
1. **Planejamento da Compra** — ainda é o próximo buraco estrutural (3 botões apontando pra ele: sidebar do catálogo, sidebar da ficha de decisão, CTA principal da ficha de decisão)
2. **Pagamento** — "Ir para pagamento" no Carrinho ainda não tem destino; é a etapa de "resolução" que fecha o ciclo
3. Toasts de confirmação pro "Enviar para Ana aprovar" e "Salvar como rascunho" dentro do Carrinho (comportamento pretendido, ainda não desenhado visualmente)
4. Gaps menores que seguem pendentes: catálogo filtrado por "reposição" (o link "Ver tudo no catálogo" dos modais do Painel do dia ainda aponta pra um filtro que não existe — só o de benchmark foi construído)

**Resolvido em rodadas anteriores**:
- Modal "Ajustar foco" agora existe em desktop (reaproveitando o `webmodal` + `goalcard`, mesmo padrão do resto)
- As 3 categorias que faltavam no Painel do dia (Lançamentos, Produtos em alta, Alertas) têm conteúdo — "Alertas" corretamente sem ação em lote, "Produtos em alta" com ação em lote ("Adicionar todos ao planejamento"), "Lançamentos" sem ação em lote (não faz sentido "aprovar todos" produtos que a pessoa ainda nem avaliou)
- "Repor todos" agora fecha o modal e mostra um toast de confirmação em lote, com o tile "Reposição necessária" mudando de estado pra "✓ Concluído"
- O link "Ajustar quantidade" do toast agora abre um modal com a grade editável por tamanho, sem sair do Radar

**Resolvido nesta rodada**:
- **Planejamento da Compra** construído em desktop — resolve os 3 botões que apontavam pro vazio: "Planejar compra" (sidebar do Catálogo), "Planejar compra" (sidebar da Ficha de Decisão) e "Adicionar ao planejamento" (CTA principal da Ficha de Decisão)
- "Enviar ao carrinho" (dentro do Planejamento) → 10 Carrinho ✅
- Botão "Ajustar foco" corrigido — estava sem nenhum estilo aplicado no desktop (herdava uma regra CSS escrita só pro contexto mobile), agora tem um estilo próprio (ghost/terciário, com ícone)

**O que ainda falta**: Pagamento (destino de "Ir para pagamento" no Carrinho) é a última peça da "resolução" da narrativa — depois dela, o ciclo de compra completo (Radar → Catálogo/Planejamento → Carrinho → Pagamento → Confirmação) está fechado ponta a ponta em desktop.

---

## Marco: ciclo de compra fechado ponta a ponta

**Pagamento e Confirmação construídos.** Isso fecha a última lacuna estrutural: "Ir para pagamento" (Carrinho) → 11 Pagamento → "Confirmar pedido" → 12 Pedido Confirmado. A narrativa completa — início (login → perfil → radar), meio (catálogo/planejamento → carrinho) e fim (pagamento → confirmação) — está navegável sem nenhum beco sem saída nesse caminho principal.

**Novo gap identificado**: o botão "Acompanhar pedido" (na tela de Confirmação) não tem destino — o módulo de Acompanhamento do Pedido ainda não foi construído em desktop. Esse é o próximo passo natural, já que fecha o "epílogo" da compra (rastreamento pós-confirmação), mas está fora do ciclo de decisão de compra em si.

**Resolvido**: Acompanhamento do Pedido construído — segue o mesmo modelo de "um pedido por vez" (timeline de status é do pedido específico, não do carrinho inteiro), com a sidebar deixando claro que o carrinho pode ter outros pedidos em paralelo, ainda não confirmados.

**Gaps que seguem de rodadas anteriores**: catálogo filtrado por "reposição" (link "Ver tudo no catálogo" dos modais do Painel do dia).

### ✅ Todos os gaps de navegação do lojista estão fechados

Última peça: Catálogo agora tem uma visão filtrada por "Reposição necessária" (banner de contexto em vermelho, chip selecionado, badge de sugestão de quantidade por produto), destino do link "Ver tudo no catálogo" no modal de reposição. Com isso, **não há mais nenhum botão apontando pro vazio** no fluxo principal do lojista, do login ao acompanhamento pós-compra.

### Nova tela: Falar com o Representante

O botão "Falar com Ana" (que já existia na sidebar do Acompanhamento do Pedido, sem destino) agora abre uma tela de chat de verdade — histórico de mensagens, indicação de status (online/tempo de resposta), e um "card de contexto" dentro da própria conversa quando uma mensagem referencia um pedido específico (reaproveita a ideia do `activitynote` que já existia no Carrinho, agora numa conversa completa). A sidebar traz atalhos diretos pros itens mencionados na conversa (carrinho, pedido), evitando que o lojista precise sair do chat pra ir procurar o que a Ana está comentando.

### Nova tela: Modal "Ajustar mix" (Planejamento da Compra)

O botão "Ajustar mix" existia na tela desde a primeira versão do Planejamento, mas nunca teve destino. Agora abre um modal com stepper de percentual por categoria (Tênis/Botas/Sandálias — corrigido depois pra refletir que o cliente vende só calçados, ver nota abaixo), validação visual de que o total soma 100%, e reforço de que o investimento total não muda — só a proporção.

**Correção de nomenclatura**: o cliente vende apenas calçados (sem acessórios/vestuário) — as categorias do mix em todas as telas (Planejamento, modal Ajustar Mix, legenda) foram trocadas de "Calçados/Acessórios/Vestuário" pra "Tênis/Botas/Sandálias" (por tipo de calçado). Produtos de exemplo que não eram calçados ("Meia Cano Alto", "Moletom Urban Winter") foram substituídos por calçados reais ("Chinelo Conforto", "Sandália Urban Winter") em todas as telas onde apareciam.

### Correção adicional: produto real da marca

Depois da correção acima, veio uma informação mais precisa direto do site da Tesla Skate (via busca — acesso direto ao site continua bloqueado por proteção anti-bot): **a marca vende exclusivamente tênis**, organizados por linha de modelo — Coil, Coil Pro, Hertz, Hertz Art, Flow, Delux, Pulse, Fusion, Nine, Vedanta, Tg02 — não por tipo de calçado (não existe bota nem sandália no catálogo real). Isso tornou a correção anterior (Tênis/Botas/Sandálias) também incorreta.

**Ajustes feitos**:
- Mix do Planejamento e do modal "Ajustar mix" agora usa 3 linhas reais como exemplo: **Coil / Hertz / Flow** (das 11 linhas existentes — a escolha de quais/quantas linhas compõem o mix de verdade é decisão de produto, não só de design)
- Todo produto fictício não-tênis foi substituído por um tênis real (ex: "Bota Urban Trail" → "Tênis Tesla Coil Black White", "Sandália Feminina X" → "Tênis Tesla Hertz Rose")
- "Coleção Urban Winter" (nome fictício de lançamento) virou "Linha Vedanta" — linha real da marca
- Preços ajustados pra faixa real observada no site: **R$ 299,90 a R$ 419,90**
- Grade de numeração real confirmada: **34 a 44** (os exemplos usados nos mockups, 36-42, já cabem dentro dessa faixa, sem necessidade de ajuste)

**Isso reforça a pendência já registrada em `requisitos-dados-inteligencia.md`**: a fórmula de "Mix ideal" agora precisa ser pensada por linha de produto, não por categoria — e com 11 linhas reais existentes, vale decidir com o time se o mix mostra todas, ou um subconjunto priorizado (ex: as 3-4 linhas mais vendidas daquela loja).

### Correção final: nomes e preços 100% reais

Depois de conseguir acesso de leitura a um revendedor autorizado (skatedosonhos.com.br — não bloqueado como o site oficial), confirmei 12 produtos reais da Tesla com nome e preço exatos. Trocamos **todos** os produtos e preços fictícios remanescentes pelos reais:

| Antes (fictício) | Agora (real, confirmado) | Preço real |
|---|---|---|
| Linha Street | Linha Coil | — |
| Tênis Tesla Nine Grey | Tênis Tesla Fusion Black Red | R$ 339,90 |
| Tênis Tesla Fusion Grey Neon | Tênis Tesla TG II Black Reflect | R$ 299,90 |
| Tênis Tesla Pulse Black | Tênis Tesla Hertz All Black Furta Cor | R$ 329,90 |
| Linha Vedanta | Linha Fusion | — |
| 3 produtos fictícios da linha | Fusion All White / Off White Tiffany / BW Pink | R$ 389,90 / R$ 299,90 / R$ 379,90 |

**Importante**: as imagens dos produtos continuam sendo um placeholder gráfico (não foram encontradas — ver conversa sobre isso). Nome, preço e linha são reais; a foto ainda não.

**Nota sobre a linha "TG II"**: o site do revendedor usa essa grafia; a navegação interna do site oficial (via busca) mostrou "Tg02" em outro lugar. Vale confirmar com o cliente qual é a grafia oficial antes de finalizar — pode ser inconsistência do próprio revendedor, não necessariamente um erro nosso.

### Correção de UX: distinção visual entre Oportunidades e Painel do dia

O Sérgio identificou que os 4 cards de "Oportunidades" e os 4 tiles do "Painel do dia" pareciam redundantes só de olhar — nada no layout comunicava que um é curadoria (o item mais urgente de cada tipo) e o outro é o índice completo (a lista inteira daquela categoria). Corrigido trocando o formato do Painel do dia de 4 caixas (que imitavam visualmente os cards de Oportunidade) pra uma **lista compacta única** — mesmo componente `listgroup`/`listrow` que já existia na versão mobile, reaproveitado aqui. A seção também foi renomeada de "Painel do dia" pra **"Todas as pendências — por categoria"**, com um subtítulo explícito conectando as duas seções ("as oportunidades acima já são a seleção mais urgente de cada uma destas — aqui está a lista completa").

### Correções urgentes da reunião com o cliente: aplicadas

**1. Preço fábrica/PDV.** Trocamos o par "com imposto/sem imposto" (que era um chute nosso baseado na reforma tributária) por **"fábrica" (o que o lojista paga) + "PDV sugerido"** (com margem calculada, ex: "+R$ 220,00 · 37%"), em toda tela de produto (Catálogo, Ficha de Decisão). O PDV sugerido agora aparece em verde, comunicando margem potencial — não é mais informação fiscal neutra, é gancho de venda, como a reunião indicou. **Os valores de PDV foram calculados por uma fórmula simples (fábrica × 1,65) só pra preencher o mockup — a fórmula real de precificação de PDV precisa vir do cliente antes do desenvolvimento.**

**2. Selo de grade mínima (36 pares).** O Carrinho agora mostra, por pedido, se a grade mínima de 36 pares foi atingida — verde com check quando sim, vermelho com a quantidade que falta quando não. No exemplo do mockup, o Pedido 1 (36 pares exatos) mostra confirmação e mantém o botão "Ir para pagamento" habilitado; o Pedido 2 (18 pares) mostra o aviso e o botão fica com aparência desabilitada (visual apenas — **o comportamento de bloqueio real, se o botão deve realmente impedir o clique ou só avisar, é decisão de produto a confirmar**).

### Correção estrutural: Condição de pagamento ≠ Forma de pagamento

O Sérgio perguntou se já tínhamos a tela de fechar pagamento por PIX/cartão/boleto — a resposta era não: a tela de Pagamento misturava **condição** (prazo — 30/60/90 dias, à vista) com **forma** (como o dinheiro se move) num único seletor de chips, sem nunca detalhar a execução de cada forma. Separado agora em duas decisões sequenciais:

1. **Condição de pagamento** (chips): 30/60/90 dias / À vista −3% — igual a antes, só removendo "Cartão" dali (não é condição, é forma).
2. **Forma de pagamento** (3 cards selecionáveis): PIX, Cartão de crédito, Boleto bancário — cada um muda o painel abaixo:
   - **PIX**: QR code + código copia-e-cola + timer de expiração (29:47)
   - **Cartão**: preview visual do cartão + formulário (número, nome, validade, CVV) + seletor de parcelamento
   - **Boleto**: código de barras visual + linha digitável + vencimento + "copiar linha digitável" / "baixar PDF"

3 telas novas no total (a original + 2 variantes), todas mantendo a mesma sidebar de contexto do carrinho/pedido. **Nota técnica**: tive que corrigir dois bugs de montagem nessas variantes no caminho (limites de substituição de texto mal calculados, gerando tag HTML quebrada e conteúdo duplicado) — mencionando aqui só pra reforçar que vale sempre conferir o arquivo renderizado antes de considerar uma tela "pronta", não só a contagem de divs balanceada.

**Atenção**: esse modal depende diretamente da mesma pendência já registrada em `requisitos-dados-inteligencia.md` — a fórmula de "Mix ideal pro seu perfil" ainda não está definida, e é ela que provavelmente vai gerar os 60/25/15% que aparecem pré-preenchidos aqui como ponto de partida. Sem essa fórmula, os valores iniciais do modal não têm de onde vir.

---

## Pendência de negócio: taxonomia de tags dos insight cards

Levantada ao construir a página da Coleção — **quantos tipos de tag/severidade os insight cards do Radar devem ter?**

**Sugestão de design**: manter em exatamente **4 tipos**, cada um amarrado a uma das 4 cores semânticas que já existem no sistema (não criar uma 5ª cor):

| Tag | Cor | Significado pretendido |
|---|---|---|
| Oportunidade | Preto | Recomendação específica, alta confiança, acionável agora |
| Risco / Alerta | Vermelho | Precisa de atenção, tendência negativa |
| Benchmark | Azul | Sinal comparativo/informativo, contexto útil, não é ação direta |
| Lançamento | Verde | Produto novo ou tendência positiva ainda não aproveitada |

**O que precisa de validação de negócio antes do desenvolvimento** (isto não é decisão de design, é modelo de dados):
- O critério exato que classifica um insight em cada uma dessas 4 categorias
- Se uma mesma situação pode gerar mais de uma tag ao mesmo tempo (ex: um produto pode ser "Lançamento" e depois virar "Oportunidade"?)
- Se existe hierarquia de exibição quando várias tags se aplicam ao mesmo insight
- Se o negócio já enxerga uma 5ª categoria necessária no futuro — se sim, o design precisa ser revisitado antes, porque a paleta atual (60/30/10 + 3 cores semânticas) não tem uma 5ª cor reservada de propósito.

---

## Pendência técnica: grades de tamanho e integração com ERP

Levantada ao construir o modal de "Ajustar reposição" — os componentes de grade (Ficha de Decisão, modal de reposição) hoje usam um conjunto de tamanhos fixo e ilustrativo (37 a 41) só pra demonstrar o layout. **Antes de desenvolver, precisamos confirmar com o cliente:**

- Quantas grades de numeração existem no catálogo real (masculino, feminino, infantil podem ter faixas diferentes)
- Se a grade é sempre sequencial (37-38-39-40-41) ou se existem tamanhos "quebrados"/intermediários
- Como o ERP do cliente representa isso hoje — se é uma tabela de grade por produto, por categoria, ou por fornecedor
- Se a quantidade sugerida por tamanho (o que aparece pré-preenchido no modal de reposição) vem pronta do ERP/analytics, ou se é um cálculo que a nossa plataforma faz por cima do estoque bruto que o ERP fornece

Isso muda a estrutura de dados do componente de grade (hoje fixo em 7 chips) e precisa ser resolvido antes do front implementar — não é ajuste visual, é a fonte da verdade dos números.

---

## Pendência de negócio: relação entre Carrinho e Pedido

Levantada depois de fechar Pagamento/Confirmação — **hoje o design assume 1 carrinho = 1 pedido** (é a lógica por trás do `cartswitcher`: cada aba é um carrinho independente, com seu próprio status, representante e fechamento). O Sérgio sinalizou que isso pode não ser assim: **um carrinho pode conter mais de um pedido dentro dele**, cada um fechando com condição própria (pagamento, prazo, talvez representante), e o carrinho como um todo é a unidade compartilhada com o representante.

**Ainda não está confirmado como regra de negócio** — por isso não mexi nas telas de Carrinho/Meus Pedidos ainda. Mas já registro aqui o que essa mudança afetaria, pra quando a regra for validada:

- **Meus Pedidos** deixaria de listar "carrinhos" e passaria a listar "carrinhos com N pedidos dentro" — muda o que aparece no card da lista (hoje mostra 1 valor/1 status por linha)
- **Carrinho (tela 10)** — o `cartswitcher` (abas) precisaria virar algo como "pedidos dentro deste carrinho", não "carrinhos diferentes". É uma mudança de hierarquia, não só de rótulo
- **Pagamento** — hoje fecha o carrinho inteiro de uma vez; se pedidos internos podem ter condição própria, o pagamento precisaria acontecer por pedido, não por carrinho — isso muda a tela de Pagamento inteira (viraria uma lista de pedidos a confirmar, não um único formulário)
- **Compartilhamento com representante** — continuaria no nível do carrinho (o todo), não por pedido individual, pelo que entendi

**O que precisamos confirmar antes de eu redesenhar isso**: um exemplo concreto de quando um lojista dividiria um carrinho em mais de um pedido — é por representante diferente dentro do mesmo carrinho? Por prazo de entrega diferente? Por condição de pagamento? O motivo de existir mais de um pedido no mesmo carrinho muda completamente como a tela deveria se comportar.

### ✅ Resolvido — regra confirmada

- O representante é **sempre o mesmo por loja** (não varia por pedido).
- Um carrinho pode ter **mais de um pedido**, separados por **prazo de entrega** e/ou **condição de pagamento** diferentes.
- O carrinho é a unidade **compartilhada com o representante**; cada pedido dentro dele **fecha e paga separadamente**.

**Telas reconstruídas com esse modelo**: Meus Carrinhos (lista, mostrando quantos pedidos cada carrinho tem), Carrinho (itens agrupados em cards de "Pedido 1", "Pedido 2", cada um com seu próprio subtotal e botão "Ir para pagamento"), Pagamento (agora fecha um pedido específico, com contexto visível de quantos outros pedidos existem no mesmo carrinho), Confirmação (idem). Também corrigi uma inconsistência que essa mudança revelou: uma tela anterior mostrava dois representantes diferentes (Ana e Marcos) pra pedidos da mesma loja, o que contradiz a regra — padronizei pra Ana em todo lugar.

---

## Nota estrutural para quando construirmos o perfil Representante

Levantada pelo Sérgio — **a relação carrinho ↔ representante é assimétrica entre as duas personas**:

- **Lojista**: 1 lojista, 1 representante fixo. O carrinho é sempre compartilhado com a mesma pessoa. Por isso "Meus Carrinhos" pôde ser uma lista solta no menu principal — não precisa de contexto adicional pra saber "de quem" é.
- **Representante**: 1 representante, **N lojistas** na carteira. A visão dele de carrinhos/pedidos não pode ser uma lista genérica — cada carrinho pertence a um cliente específico. Isso sugere que, pro representante, a navegação até um carrinho provavelmente passa **pela Carteira de Clientes primeiro** ("abrir Loja X" → carrinhos daquela loja), em vez de existir como uma aba "Meus Carrinhos" independente no menu dele.

**Implicação pra quando chegarmos lá**: o componente de lista (`pcard-web` reaproveitado em Meus Carrinhos) provavelmente precisa de uma variante com o nome do lojista em destaque, já que "de quem é esse carrinho" é a primeira pergunta que o representante faz — diferente do lojista, que já sabe que é o carrinho dele.

**Hierarquia completa, pra não ficar ambíguo quando desenharmos**:

```
Representante
  └─ Cliente (loja) — ex: Radical Skate
       └─ Carrinho — ex: "Coleção Inverno", "Giro Hertz Black" (um cliente pode ter um ou mais carrinhos)
            └─ Pedido — ex: "Pedido 1" (30/60/90), "Pedido 2" (à vista) (um carrinho tem um ou mais pedidos — o caso mais comum é só 1; vira mais de 1 apenas quando o lojista precisa dividir por prazo/pagamento diferente)
```

O representante nunca pula direto pra um pedido — ele entra pela Carteira de Clientes, escolhe o cliente, escolhe o carrinho (se houver mais de um), e só então vê os pedidos daquele carrinho especificamente. São 3 níveis de navegação, não 2.

---

### Gap fechado: "Criar nova senha"

O link de recuperação de senha (0.2b) sempre apontou pra uma tela que não existia — o destino real do link enviado por e-mail. Construídas 2 telas: **0.2c Criar Nova Senha** (campo de nova senha + confirmação, com regra mínima de 8 caracteres visível) e **0.2d Senha Alterada** (confirmação de sucesso, botão "Ir para o login"). Mesmo padrão visual do resto do fluxo de autenticação (hero split-screen com a foto aérea).

Com isso, o fluxo completo de recuperação de senha está fechado ponta a ponta: Login → "Esqueci minha senha" → pedir e-mail → confirmação de envio → **criar nova senha → confirmação de sucesso** → volta pro login.
