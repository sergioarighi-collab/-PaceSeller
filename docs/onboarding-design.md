# Retail Performance Platform — Guia de Onboarding para Design

> Este documento é um resumo conceitual do produto para quem está entrando no time agora. Ele explica o *porquê* antes do *como* — para detalhes de tela por tela, veja `product-design-retail-performance-platform.md` (especificação funcional) e os arquivos de mockup em alta fidelidade (`telas-mobile.html` / `telas-tablet.html`) e o `wireflow.svg` (mapa de navegação completo).

---

## 1. O conceito do produto

Hoje, a cadeia de moda e calçados funciona de forma linear:

**Indústria → Representante → Lojista → Consumidor**

Cada elo só enxerga o que está logo à sua frente. A indústria não sabe por que uma coleção não vendeu numa região. O representante decide quem visitar por instinto e agenda. O lojista compra por experiência, não por dado. E ninguém aprende sistematicamente com o que já aconteceu.

O Retail Performance Platform propõe outra lógica: um **ecossistema colaborativo**, onde indústria, representante e lojista se conectam através de uma plataforma central que funciona como o **"cérebro" da relação comercial**:

```
        Plataforma
       ↗    ↕    ↖
Indústria ↔ Representante
       ↖    ↕    ↗
          Lojista
```

Todos alimentam dados. Todos recebem inteligência de volta. Todos trabalham para vender mais — e a plataforma fica mais inteligente a cada ciclo de compra.

### O princípio que guia todas as decisões de design

> **Não mostrar dados. Mostrar decisões.**

Isso não é um slogan — é um critério prático que usamos pra avaliar cada tela. A pergunta nunca é "o que eu exibo aqui?", é **"que decisão essa tela ajuda a pessoa a tomar agora?"**. Um número sozinho ("+18% de vendas") é dado. Um número com contexto e uma ação anexada ("Vendendo 18% acima da média — reponha agora") é decisão.

Isso explica escolhas que podem parecer estranhas à primeira vista: por que a home do produto não é o catálogo, por que a ficha de produto mostra "por que comprar" antes da grade de tamanhos, por que os botões são sempre verbos.

---

## 2. A estratégia

**Por que isso é diferente do que existe hoje:** praticamente nenhuma indústria de calçados/moda no Brasil tem uma funcionalidade equivalente ao nosso **Radar Comercial** — um feed de oportunidades que abre a plataforma já mostrando o que fazer, em vez de um catálogo de produtos pra navegar. Essa é a aposta central do produto.

**O que cada persona ganha, concretamente:**

- **Lojista** — para de comprar só por intuição ou conversa com o representante. Passa a comprar com dados: o que vende bem no seu perfil de loja, quando repor, qual mix monta a melhor margem.
- **Representante** — para de gerenciar a carteira de memória. Sabe todo dia quem priorizar, quem está prestes a recomprar, quem sumiu.
- **Indústria** — enxerga, pela primeira vez, o comportamento agregado de milhares de lojistas: o que está funcionando por região, quais representantes precisam de apoio, quais coleções estão indo bem.

**Onde o e-commerce entra:** só no fim. Pedido, pagamento e entrega existem, mas são a *execução* de uma decisão que já foi tomada antes, com ajuda de dado. O checkout não é o produto — é o último passo dele.

---

## 3. As personas

| Persona | Quem é | O que faz na plataforma |
|---|---|---|
| **Lojista** | Dono(a) ou comprador(a) de uma loja multimarca | Descobre oportunidades, planeja compras, faz pedidos, acompanha entregas, fideliza os próprios clientes |
| **Representante** | Vendedor(a) externo, com carteira de lojistas | Prioriza visitas e contatos, monta pedidos sugeridos, aprova pedidos dos lojistas, acompanha a carteira |
| **Indústria** | Gestor(a) de marca / trade marketing | *(fora do escopo de telas já desenhado — mencionado aqui por contexto do ecossistema)* |

Uma particularidade de design importante: a conta do **representante pode ser usada por auxiliares da equipe dele**. Por isso existe um fluxo de login com uma etapa extra de identificação (PIN individual por pessoa) — toda ação fica atribuída a quem de fato a realizou, mesmo quando várias pessoas operam sob a mesma conta.

---

## 4. Os módulos

O produto é organizado por **capacidade**, não por "tela" — ou seja, pensamos em "o que a pessoa consegue fazer aqui" antes de pensar em nome de menu.

### 4.1 Login & Perfil
A porta de entrada. Separa o fluxo do lojista do fluxo do representante desde a primeira tela. Para o lojista, inclui um wizard curto de configuração (dados da loja, dados de vendas, objetivo do momento) que alimenta a personalização do Radar desde o primeiro dia — sem esse preenchimento inicial, a plataforma não tem base pra ser inteligente. Para o representante, inclui a etapa de identificação de auxiliares descrita acima.

### 4.2 Radar Comercial
**O módulo mais importante do produto** — é a home de todo mundo. Em vez de abrir a plataforma e ver produtos, a pessoa abre e vê oportunidades: o que vender, quem contatar, o que repor, o que está em risco. Cada persona tem seu próprio Radar (lojista vê a saúde da própria loja; representante vê a carteira de clientes priorizada), mas os dois seguem o mesmo padrão visual: cards de insight com severidade (oportunidade / risco / benchmark) e uma ação anexada a cada um.

### 4.3 Catálogo Inteligente
O catálogo deixa de ser uma vitrine e vira uma ferramenta de decisão. Cada produto é apresentado com selos de inteligência (crescimento, recompra, margem, indicação de reposição) em vez de só preço e SKU. Na ficha do produto, o bloco "por que comprar este produto" aparece **antes** da grade de tamanho e cor — inversão proposital da hierarquia que qualquer e-commerce tradicional usaria.

### 4.4 Planejamento da Compra
O módulo mais estratégico do ponto de vista de negócio. Em vez de comprar item a item, o lojista define um objetivo ("montar coleção de inverno", "repor estoque") e a plataforma sugere o mix inteiro: produtos, grade, investimento, giro previsto e margem estimada — tudo ajustável antes de virar pedido.

### 4.5 Sidebar de Pedido
Um painel que acompanha o lojista durante o Catálogo, o Planejamento e o Carrinho, narrando a composição do pedido em tempo real — não só "quantos itens e quanto custa", mas insights tipo "você está a R$ 800 de frete grátis" ou "falta categoria feminina nesse mix". É o elemento que costura os outros módulos entre si.

### 4.6 Carrinho Inteligente
Aqui a inteligência já aconteceu — o carrinho só executa. Mas com uma particularidade importante: **cada pedido é o seu próprio carrinho**. Um lojista pode ter várias "cestas" abertas ao mesmo tempo (um pedido com um representante, uma reposição rápida com outro), cada uma com seu próprio status (rascunho → compartilhado → aprovado → confirmado). O carrinho é compartilhado de verdade com o representante — ele vê, comenta e aprova o mesmo objeto que o lojista está montando, em vez de receber um pedido fechado por WhatsApp.

### 4.7 Serviços
*(Módulo novo, ainda não estava documentado antes deste resumo.)*

Enquanto os módulos acima são sobre **decisão e inteligência**, o módulo de Serviços é deliberadamente o oposto: é a área **operacional e de autoatendimento** da plataforma. Existe porque nem todo problema do lojista é "o que devo comprar" — às vezes é só "preciso da segunda via desse boleto agora" ou "cadê a nota fiscal do pedido de março". Cobre:

- **Segunda via de boleto** — reemissão rápida de boletos em aberto ou já pagos, sem precisar ligar pra ninguém.
- **Nota fiscal** — acesso e download da nota fiscal de qualquer pedido, a qualquer momento.
- **Histórico de pedidos** — diferente do módulo "Meus Pedidos" (que mostra os carrinhos *ativos*, em andamento), este é o arquivo completo: todos os pedidos já fechados, com filtro por período, representante, status e valor.

Do ponto de vista de design, essa é uma escolha consciente: **nem toda tela precisa "parecer inteligente"**. Para tarefas de compliance e resgate de documento, o que o lojista quer é confiabilidade e velocidade — encontrar o boleto em três toques, sem insight nenhum no meio do caminho. Aplicar o mesmo tratamento de "cards de oportunidade" aqui seria ruído, não ajuda. Serviços deve ser a área mais direta e previsível de toda a plataforma.

### 4.8 Pós-venda — Radar de Fidelização
Fecha um ciclo que geralmente fica de fora de plataformas B2B: ajudar o lojista a fidelizar o *consumidor final* da loja dele, não só comprar melhor da indústria. Usa o mesmo padrão visual do Radar Comercial (cards de insight, severidade por cor), mas voltado pra carteira de consumidores: aniversariantes da semana, clientes sem contato há 90+ dias, produto com maior taxa de recompra. Existe porque perguntamos "o que o lojista gostaria de ser ajudado no pós-venda?" — e a resposta não é sobre comprar mais, é sobre vender melhor pro cliente dele.

---

## 5. Como os módulos se conectam

```
Login/Perfil → Radar Comercial → Catálogo/Planejamento → Carrinho (Sidebar acompanha tudo)
                     ↑                                           ↓
              Pós-venda ←──────────── ciclo contínuo ──── Pagamento → Acompanhamento
                                                                       ↑
                                                          Serviços (acesso paralelo,
                                                          a qualquer momento — não faz
                                                          parte do ciclo de decisão)
```

Repare que **Serviços não entra no ciclo principal** — ele é acessível a qualquer momento, em paralelo, como uma gaveta de utilidades. Todo o resto (Radar → Catálogo → Planejamento → Carrinho → Pagamento → Acompanhamento → Pós-venda → de volta ao Radar) é um ciclo fechado: cada pedido confirmado vira dado novo que realimenta o Radar na próxima vez que a pessoa abrir a plataforma. É esse ciclo fechado que sustenta a ideia de "cérebro do ecossistema" na prática, não só no discurso.

---

## 6. Sistema de design (resumo)

- **Regra de cor 60/30/10**: branco domina (superfícies), cinza estrutura (bordas, texto secundário), preto é reservado só pra CTAs e destaques de maior prioridade — nunca preenchimento grande, nem em cards de oportunidade.
- **Cor semântica** (verde/vermelho/azul) é sinal funcional pontual — indica risco/oportunidade/benchmark —, nunca decoração.
- **Tipografia**: Space Grotesk (títulos), IBM Plex Sans (corpo), IBM Plex Mono (números e dados).
- **Cantos fechados** (4px controles, 8px containers) — reforça a sensação de instrumento de precisão, não app de consumo.
- **Botões sempre verbo primeiro**: "Planejar", "Confirmar pedido", "Repor agora" — nunca substantivos.

Detalhes completos de token, componente e estado estão nos arquivos de mockup — este documento é só o mapa mental pra entender onde cada peça se encaixa antes de mergulhar nas telas.

---

## 7. Por onde começar

Se está chegando agora, a ordem recomendada de leitura é:
1. Este documento (visão geral)
2. `wireflow.svg` — pra ver o mapa de navegação completo das duas personas
3. `telas-mobile.html` — pra ver as telas em alta fidelidade, na ordem de navegação
4. `product-design-retail-performance-platform.md` — pra entender a lógica funcional de cada módulo em mais profundidade
