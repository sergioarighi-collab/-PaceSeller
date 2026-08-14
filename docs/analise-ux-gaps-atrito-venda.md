# Retail Performance Platform — Análise de Fluxo: Gaps e Atrito na Venda
## Simulação completa como lojista comprando, sob a ótica de UX + Product Design + Product Management

> Percorri as 31 telas do início ao fim como se fosse o Carlos (persona do lojista) fechando uma compra de verdade — não validando só "o botão leva a algum lugar" (isso já está coberto na auditoria de navegação), mas perguntando **"isso ajuda a fechar a venda, ou coloca uma pedra no caminho?"**. Organizei por impacto na conversão, não por ordem de tela.

---

## 🔴 Alto impacto — atrito real que pode custar a venda

### 1. O sino de notificação no TopNav não faz nada
Toda tela autenticada tem um ícone de sino no canto superior direito — mas ele nunca ganhou um dropdown, um badge de contagem, nada. Isso parece pequeno, mas é estrutural: a plataforma inteira é baseada em **"a inteligência avisa, o lojista age"** — sem notificação de verdade, o lojista só descobre que "Ana comentou seu carrinho" ou "seu pedido atrasou" se abrir a tela certa por acaso. Isso mata o valor do produto de "cérebro do ecossistema" que documentamos lá no início.

**Solução sugerida**: dropdown de notificações (mesmo padrão visual do menu do avatar), com pelo menos 3 tipos de evento: comentário do representante, mudança de status de pedido, novo insight de alta prioridade no Radar. Badge numérico no sino quando houver não lidas.

### 2. Nenhum jeito de dizer "não, obrigado" pra um insight
Cada card do Radar assume que o lojista vai agir. Não existe um "dispensar"/"não é pra mim agora" em nenhum card. Na vida real, um lojista vai ignorar cards irrelevantes repetidamente — e sem um mecanismo de feedback, dois problemas acontecem: (a) a pessoa começa a ignorar o Radar inteiro por cansaço visual, (b) a plataforma nunca aprende que aquele tipo de sugestão não serve pra aquela loja.

**Solução sugerida**: um "×" discreto ou menu de 3 pontos em cada insight card, com opção "Não é pra mim" — some da lista, e opcionalmente alimenta a regra de negócio de personalização (fica registrado no documento de dados de inteligência como um novo input, não só um dado de saída).

### 3. Nenhuma visibilidade de crédito/limite antes do pagamento
O lojista monta o carrinho inteiro, divide em pedidos, escolhe "30/60/90 dias" como condição — e só descobre se tem limite de crédito aprovado pra isso na hora de confirmar (ou pior, depois). Isso é um clássico motivo de abandono em B2B: a pessoa investe tempo montando o pedido e esbarra numa rejeição de crédito no fim.

**Solução sugerida**: mostrar o limite de crédito disponível (ou "sujeito à análise") já na sidebar do Carrinho, ao lado do total — não esperar até o Pagamento pra revelar isso.

### 4. Não dá pra saber se o produto está pronto pra enviar
Nenhuma tela (Catálogo, Ficha de Decisão, Carrinho) mostra se o item está **disponível pra envio imediato** ou **sob encomenda/aguardando produção**. Isso é informação crítica pra decisão de compra B2B — "reposição em 45 dias" no card mistura dois conceitos diferentes (tempo até precisar repor vs. tempo até o produto chegar), e um lojista com urgência real pode se surpreender depois.

**Solução sugerida**: um badge de disponibilidade separado ("Pronta entrega" / "Sob encomenda — X dias") em todo card de produto, distinto do badge de "reposição recomendada em Xd" (que é sobre a necessidade da loja, não sobre a disponibilidade do fornecedor).

---

## 🟡 Médio impacto — perda de oportunidade, não bloqueio

### 5. "Cenários alternativos" no Planejamento nunca foi construído
Lá no primeiro documento conceitual do produto (`product-design-retail-performance-platform.md`), a gente já tinha escrito a ideia de comparar "mix mais conservador vs. mix mais agressivo em lançamentos" lado a lado no Planejamento. Isso nunca virou tela. É uma promessa que fizemos ao próprio produto e não cumprimos ainda — vale relembrar antes de considerar o módulo "fechado".

**Solução sugerida**: no Planejamento, um toggle ou par de botões "Conservador / Recomendado / Agressivo" que recalcula o mix inteiro (itens, giro, margem) — não precisa ser 2 telas separadas, pode ser o mesmo layout trocando os números ao clicar.

### 6. Não existe comparação de produtos no Catálogo
Lojista decidindo entre 2-3 tênis parecidos (ex: Coil vs. Hertz) não tem como colocar lado a lado — precisa abrir um, voltar, abrir outro, tentando lembrar os números do primeiro.

**Solução sugerida**: checkbox discreto nos cards ("comparar") que acumula até 3 produtos e abre um modal/tela com os atributos lado a lado (mesmo padrão de tabela que já usei nos comparativos de opções anteriores nesta conversa).

### 7. Chat só é alcançável de dentro de um pedido específico
Hoje "Falar com Ana" só aparece na sidebar do Acompanhamento. Se o lojista quiser falar com ela sobre qualquer outra coisa (uma dúvida geral, por exemplo), não tem um ponto de entrada global.

**Solução sugerida**: ícone de chat persistente no TopNav (ao lado da busca e do sino), sempre visível — não só contextual.

### 8. Interação de mover item entre pedidos do carrinho continua indefinida
Já está registrada como pendência no documento de fluxo, mas reforço aqui pela lente de venda: se o lojista **não conseguir** reorganizar itens entre pedidos de forma óbvia, ele pode simplesmente desistir de dividir o carrinho e fechar tudo num pedido só (perdendo o benefício de condições diferentes) — ou pior, abandonar o carrinho por frustração.

**Solução sugerida**: um menu de 3 pontos em cada `cartline` com "Mover para outro pedido" → lista os pedidos existentes do carrinho + opção "criar novo pedido com este item".

---

## 🟢 Baixo impacto — polish, mas vale registrar

### 9. Sem indicação de quantidade mínima de pedido (MOQ)
Se a indústria exige grade mínima por SKU, isso nunca é mostrado nem validado em nenhuma tela — o lojista só descobriria isso se alguém (representante?) avisasse manualmente.

### 10. Sem estado de erro de pagamento
Pagamento recusado, boleto não gerado, etc. — nenhum desses cenários tem tela. Não é bloqueio de venda em si, mas é o tipo de coisa que, sem tratamento, vira suporte manual via WhatsApp (o que o produto inteiro tenta evitar).

### 11. Sem ordenação visível no Catálogo (só filtros)
"Recomendado pra você" é a única ordenação ativa — não tem "menor preço", "mais vendido", etc. Baixo impacto porque o Catálogo já é bem direcionado, mas lojistas que gostam de explorar por conta própria podem sentir falta.

---

## O que eu sugiro fazer com isso

Não vou construir os 11 de uma vez — são naturezas diferentes (alguns são tela nova, outros são um componente pequeno, outros são decisão de negócio antes de qualquer design). Minha sugestão de ordem, pensando em impacto de venda:

1. **Notificações** (#1) e **crédito visível** (#3) — os dois mexem diretamente com "o lojista confia e volta todo dia" e "o lojista não é surpreendido negativamente no fim". São os que eu priorizaria primeiro.
2. **Disponibilidade de envio** (#4) e **dispensar insight** (#2) — resolvem ambiguidade e fadiga, respectivamente.
3. Os de médio impacto (#5-8) dá pra ir intercalando com o resto do trabalho.
4. Os de baixo impacto (#9-11) ficam documentados como pendência, sem pressa.

Isso tudo já está registrado aqui pra entrar na leva de documentação que vai pro Claude Code — quando você validar as prioridades, eu atualizo a auditoria de navegação e o documento de requisitos de dados de acordo.
