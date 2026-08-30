# Cruzamento: Reunião com Cliente (07/08/2026) × Pendências já Documentadas

> Este documento existe pra não perder o valor da reunião no meio dos outros documentos. Cada pendência que já tínhamos registrada (na auditoria, no documento de dados de inteligência, ou em conversa) foi cruzada com o que saiu da reunião. Resultado: **2 correções urgentes nos mockups**, várias pendências resolvidas, e algumas pendências novas que a própria reunião revelou.

---

## 🔧 Correções urgentes nos mockups (a reunião provou que erramos)

### 1. Preço: não é "com/sem imposto", é "Fábrica vs. PDV sugerido"

Em toda tela de produto (Catálogo, Ficha de Decisão, Linha Fusion) eu mostro dois valores como se fossem "preço com imposto" e "preço sem imposto" — isso foi um chute meu lá atrás, baseado na reforma tributária. **A reunião mostrou que o par de preços que realmente importa pro negócio é outro**: o **valor de fábrica** (o que o lojista paga) e o **preço sugerido de PDV** (o que a Tesla recomenda que ele revenda pro consumidor final). Isso não é um detalhe técnico de imposto — é uma **ferramenta ativa de proteção de posicionamento de marca**: a Tesla usa o PDV sugerido pra evitar que um lojista destrua o preço de mercado vendendo muito abaixo no e-commerce dele.

**Isso muda a tela, não só o rótulo.** Preciso trocar "R$ X com imposto / R$ Y sem imposto" por algo como "R$ X (valor fábrica) · PDV sugerido: R$ Y" — e o PDV deveria comunicar a **margem potencial** do lojista, o que é um gancho de venda muito mais forte do que informação fiscal.

### 2. Falta validação de grade mínima (36 pares por pedido)

Nenhuma tela hoje avisa ou impede o lojista de fechar um pedido abaixo do volume mínimo. Agora sabemos a regra exata: **36 pares no total do pedido**, podendo ser distribuídos livremente (não precisa ser 36 do mesmo modelo, nem seguir curva de numeração fixa — isso já eu tinha acertado, "grade livre" bate com o que desenhei). O que falta é o **Carrinho avisar quando o pedido está abaixo de 36 pares**, e idealmente bloquear o fechamento até bater o mínimo — mesmo padrão visual do nudge "você está a R$X do frete grátis" que já existe na sidebar, só que agora com uma regra real por trás.

---

## ✅ Pendências que a reunião resolveu

| Pendência (onde estava registrada) | O que a reunião esclareceu |
|---|---|
| Fórmula de "Mix ideal pro seu perfil" (`requisitos-dados-inteligencia.md`) | Não existe uma fórmula de "mix ideal" no sentido que eu supunha — existe uma **classificação de cliente em 3 categorias (3, 6, 9)** que determina **quais linhas de produto aquele lojista pode acessar** (do mais básico ao mais tecnológico). O "mix" não é uma sugestão de proporção ideal — é um filtro de catálogo baseado em categoria de cliente. Isso simplifica bastante essa pendência, mas cria uma nova (ver abaixo). |
| Estrutura da referência de produto ("tipo + cor"?) | Não é "tipo + cor". É **Linha (nome ligado a energia) + Ano + Número de lançamento no ano + Cor** — ex: `Fusion-2026-3-01`. Um único modelo pode ter dezenas de variações de cor ao longo do tempo (um caso chega a 66). |
| Se imagens/tamanho/preço já estão no ERP (`requisitos-dados-inteligencia.md`, item de imagem de produto) | **Produto, tamanho e imagem já estão no ERP.** O preço de fábrica também. **O preço de PDV sugerido não está** — precisa ser gerido direto no Pace Seller. Isso é uma boa notícia: quando a integração de ERP existir de verdade, as imagens reais devem vir por ali — o bloqueio que tivemos pra achar fotos nesta fase de mockup não se repete na integração real. |
| Multi-carrinho com visibilidade cruzada representante-lojista (`auditoria-navegacao-lojista-desktop.md`, modelo Carrinho/Pedido) | **Validado e bem recebido pelo cliente.** E revelou uma direção que eu não tinha desenhado: **o representante também pode montar um carrinho e deixar pro lojista finalizar** — não é só o lojista compartilhando com o representante, é bidirecional. Isso ativa a etapa "Montar Pedido Sugerido" que já estava no wireflow original mas nunca foi desenhada. |
| Visibilidade de crédito antes do pagamento (item #3 da minha análise de UX/atrito, `analise-ux-gaps-atrito-venda.md`) | Confirmado como **gap real também do lado do cliente**, não só uma hipótese minha — hoje é 100% manual (alguém confere duplicatas em aberto na mão antes de aprovar um pedido novo). Isso não resolve o gap, mas confirma que ele é prioritário — o próprio cliente já reconhece como próximo passo. |

---

## 🆕 Pendências novas que a reunião revelou

### A categoria de cliente (3/6/9) não existe em nenhum sistema hoje
É curadoria manual do representante (porte da loja, crédito, histórico de pagamento, presença digital, e até "combina com o posicionamento da marca"). Isso levanta uma pergunta de fluxo que não tínhamos: **quem atribui a categoria 3/6/9 de um lojista dentro do Pace Seller?** Duas hipóteses, nenhuma desenhada ainda:
- O representante define a categoria manualmente dentro da plataforma (ação dele, não do lojista)
- A categoria fica fora do MVP e continua sendo controlada só pelo ERP atual, com o Pace Seller só *lendo* o resultado

**Decisão (Sérgio, 07/08/2026): "isso vamos ver mais pra frente".** Ou seja, não é uma dúvida aberta esperando resposta — é uma decisão consciente de adiar. Na prática, isso significa: **nenhum filtro de catálogo por categoria 3/6/9 deve ser desenhado ou implementado até essa decisão ser retomada.** Se alguma tela precisar mostrar "produtos disponíveis pro seu perfil", tratar como fora de escopo por enquanto, não como uma lacuna a preencher com suposição.

Isso também significa que **o onboarding do lojista que já desenhamos (segmento, porte, público-alvo) não é a mesma coisa que a categoria 3/6/9** — são dois níveis de informação diferentes. O onboarding alimenta o Radar; a categoria 3/6/9 controla o que aparece no Catálogo. Preciso deixar isso mais claro visualmente quando integrarmos.

### Condição de pagamento não é livre escolha — é liberada por cliente
Hoje minha tela de Pagamento mostra "30/60/90 dias" e "boleto à vista −3%" como se o lojista pudesse escolher livremente. Na realidade, **a condição disponível é decidida comercialmente por cliente** (começa só à vista, "escala" pra 30/60/90 conforme histórico de pontualidade). Isso significa que a tela de Pagamento deveria mostrar **só as condições liberadas pra aquele lojista específico**, não todas as opções sempre. Não é urgente redesenhar agora, mas é uma correção de comportamento a fazer.

### Onde a avaliação de crédito roda: aberto
O cliente não decidiu ainda se a aprovação de crédito/pedido deve acontecer dentro do Pace Seller ou no sistema atual dele. Isso trava qualquer desenho mais profundo do "Enviar para representante aprovar" — hoje meu mockup assume que a aprovação é só um "ok" do representante dentro do Carrinho, mas pode ser que exista uma etapa de aprovação de crédito por trás que a gente ainda não sabe onde mora.

---

## 📌 Confirmado como fora de escopo do MVP (não desenhar agora)

- ~~**Combos**~~ **(implementado no protótipo em ago/2026, apesar de continuar fora do MVP formal)** — misturar produto parado com produto de giro melhor. Ideia validada, bem recebida em reunião, era "evolução futura, não requisito desta fase" — mas o cliente pediu explicitamente pra simular dentro do protótipo mesmo assim, como vantagem de venda pra próxima fase (mostrar a possibilidade, não é compromisso de entregar no MVP). Ver "Combos sugeridos" em `docs/guia-dev-frontend.md` pra como ficou. A lógica de negócio por trás ("produto parado → oferta direcionada por perfil de lojista que absorveria aquele produto") é quase idêntica ao conceito do bloco "Destaque da semana" do Radar — pode virar a mesma engine de verdade no futuro, hoje os dois são curados à mão.
- **Controle de revenda em marketplace terceiro** (Mercado Livre, TikTok Shop) — reconhecido como fragilidade pelo próprio cliente, mas não prioritário agora.
- **Política de preço diferenciada por perfil de cliente** — não existe hoje, preço de venda é único; só a condição de pagamento varia.
- **Expansão internacional** — a operação Argentina é separada (distribuidora própria) e não entra no escopo do Pace Seller B2B agora.

---

## Ajustes numéricos a fazer (menor prioridade, mas vale corrigir)

- **Prazo de entrega**: uso "7 dias úteis" em várias telas (Carrinho, Pagamento, Acompanhamento). O cliente citou **~15 dias como prazo típico real**, com casos pontuais de até 2 dias. Vale ajustar os exemplos pra não estabelecer uma expectativa irreal.
- **Referência de produto**: nenhuma tela hoje mostra o código de referência do produto (`Fusion-2026-3-01`). Pode valer adicionar isso como informação secundária na Ficha de Decisão, já que é like isso que aparece nos documentos internos do cliente.

---

## O que eu sugiro como próximo passo

Não vou mexer em nada ainda sem seu aval, porque duas dessas correções (preço fábrica/PDV e a categoria 3/6/9) mudam a leitura de várias telas de uma vez. Sugiro nessa ordem:

1. **Corrigir o par de preços** (fábrica/PDV) em todos os cards — é a correção mais urgente e mais simples de aplicar.
2. **Adicionar o aviso de grade mínima (36 pares)** no Carrinho/sidebar.
3. ~~Decidir com você (ou levar pro Cleomar) quem atribui a categoria 3/6/9~~ — **decidido: adiado**, não desenhar filtro de catálogo por categoria por enquanto.
4. Ajustar os números de prazo de entrega.

Quer que eu comece pelos itens 1 e 2 agora?
