# Retail Performance Platform — Requisitos de Dados para a Camada de Inteligência

> Este documento existe porque quase toda tela que desenhamos até agora mostra um número, uma recomendação ou um destaque que "parece mágico" — mas cada um desses vem de algum lugar. Se não mapearmos a origem de cada um agora, o dev vai descobrir isso na hora errada (no meio da implementação) e o time de dados vai descobrir tarde demais que precisa de uma fonte que não estava no radar. Este é o inventário completo.

---

## 1. Como ler este documento

Cada peça "inteligente" do produto foi classificada numa dessas 4 origens:

| Origem | O que significa | Exemplo |
|---|---|---|
| 🟦 **Perfil da loja** | Vem do que o próprio lojista preencheu no onboarding | Segmento, porte, público-alvo |
| 🟩 **ERP do lojista** | Vem do sistema de vendas/estoque do lojista, via integração | Estoque atual, histórico de vendas, giro |
| 🟨 **Dados agregados da plataforma** | Vem de comparar esta loja com outras lojas na base — só existe se a plataforma já tiver volume suficiente de lojas parecidas | Benchmark ("lojas parecidas venderam +30%") |
| 🟥 **Regra de negócio a definir** | Não é um dado que "vem de algum lugar" — é uma fórmula, limiar ou política que alguém do time precisa decidir | Fórmula do "Mix ideal", valor do frete grátis |

Uma peça pode depender de mais de uma origem ao mesmo tempo (ex: "Mix ideal" cruza perfil da loja + regra de negócio).

---

## 2. Inventário por módulo

### Onboarding (Perfil da Loja)
| Elemento | Origem | Observação |
|---|---|---|
| Nome, segmento, porte, região, público-alvo | 🟦 Perfil da loja | Input direto, sem cálculo |
| Ticket médio, categorias mais vendidas, sazonalidade | 🟦 Perfil da loja **ou** 🟩 ERP | Manual (etapa 2) ou importado se conectar sistema de vendas — os dois caminhos precisam produzir o mesmo formato de dado pro resto da plataforma usar |
| "Objetivo do momento" | 🟦 Perfil da loja | Alimenta a priorização do Radar, mas falta a regra de peso (ver linha do Radar abaixo) |

### Radar Comercial
| Elemento | Origem | Observação |
|---|---|---|
| Card "Oportunidade" (ex: alta demanda regional) | 🟨 Dados agregados | Precisa de dados de venda de outras lojas da mesma região/porte — não funciona só com o dado da própria loja |
| Card "Risco" / Estoque baixo | 🟩 ERP | Estoque atual + velocidade de venda (giro) — ambos precisam vir do ERP em tempo real ou quase, senão a urgência do card fica desatualizada |
| Quantidade sugerida de reposição (ex: "32 unidades") | 🟩 ERP + 🟥 regra de negócio | Estoque e giro vêm do ERP; a fórmula que transforma isso numa quantidade sugerida é regra de negócio ainda não definida — já sinalizada em `auditoria-navegacao-lojista-desktop.md` junto com a pendência de grade/tamanho |
| Card "Benchmark" (lojas parecidas) | 🟨 Dados agregados | Mesma dependência do card de Oportunidade — sem volume de lojas parecidas na base, esse card não tem o que mostrar (ver seção 3) |
| Card "Lançamento" | 🟦 Perfil da loja + dado de catálogo (data de disponibilidade) | Mais simples, não depende de dado agregado de outras lojas |
| "Painel do dia" (contadores por categoria) | 🟩 ERP + 🟥 regra de negócio | Cada contador tem sua própria lógica de inclusão, nenhuma foi formalizada como fórmula |
| Estado vazio / % de perfil completo | 🟦 Perfil da loja | Precisa de regra de pontuação (quais campos contam quanto) — não definida |
| "Ajustar foco" (reordenar por objetivo) | 🟦 Perfil da loja + 🟥 regra de negócio | A escolha de objetivo existe, mas o peso de cada objetivo sobre cada tipo de card não foi especificado |

### Catálogo Inteligente / Ficha de Decisão
| Elemento | Origem | Observação |
|---|---|---|
| Badges de crescimento, recompra, margem | 🟨 Dados agregados (crescimento) + 🟩 ERP (recompra e margem da própria loja) | Mistura origens no mesmo card — vale deixar claro pro front que nem todo número do card vem do mesmo lugar |
| "Reposição recomendada em Xd" | 🟩 ERP + 🟥 regra de negócio | Mesma dependência da quantidade sugerida do Radar |
| Preço com/sem imposto | 🟥 Motor fiscal externo | Alíquota efetiva do IBS/CBS por produto/estado — fonte externa, não é dado que o time de produto decide |
| Grade sugerida (tamanhos pré-marcados) | 🟩 ERP | Depende da pendência de grade/tamanho já registrada na auditoria |

### Planejamento da Compra
| Elemento | Origem | Observação |
|---|---|---|
| Mix sugerido (% por categoria) | 🟦 Perfil da loja + 🟥 regra de negócio | "Mix ideal" é citado em várias telas mas a fórmula nunca foi definida em lugar nenhum — é a pendência de maior impacto deste documento |
| Giro previsto, margem estimada, cobertura % | 🟩 ERP + 🟨 dados agregados (se comparar com médias de mercado) | Depende de quanto desses cálculos usa só a própria loja vs. compara com outras |
| Quantidade sugerida por item do mix | 🟩 ERP + 🟥 regra de negócio | Mesma família de pendência da reposição |

### Carrinho / Sidebar (nudges)
| Elemento | Origem | Observação |
|---|---|---|
| "Você está a R$X de frete grátis" | 🟥 Regra de negócio | Valor do limiar de frete grátis — não existe ainda, é política comercial pura |
| "Categoria X sub-representada" | 🟦 Perfil da loja + 🟥 regra de negócio | Depende da mesma fórmula de mix ideal |
| "Margem média do pedido X pts acima do histórico" | 🟩 ERP | Precisa de histórico de pedidos anteriores da própria loja pra comparar |
| Barra "Mix ideal pro seu perfil" (%) | 🟦 + 🟥 | Mesma pendência da fórmula de mix — este é o 5º lugar diferente onde essa fórmula é citada sem estar definida |

### Pós-venda (conceitual, ainda não desenhado em desktop)
| Elemento | Origem | Observação |
|---|---|---|
| Aniversariantes, clientes sem contato 90+ dias | Dado de CRM do consumidor final | Fonte inteira ainda não mapeada — não vem do ERP de estoque/vendas B2B, precisa de um cadastro de consumidores que hoje não está em nenhum documento técnico |
| Produto mais recomprado | 🟩 ERP (histórico de venda ao consumidor final) | Mesma observação acima — depende de um tipo de dado que a plataforma ainda não sabemos se vai receber |

---

## 3. Os 3 riscos que mais importam, em ordem

1. **A fórmula de "Mix ideal pro seu perfil" está em 5 lugares diferentes do produto e não existe em nenhum.** Radar, Catálogo, Planejamento, Carrinho e Sidebar citam esse número. Se essa regra não for definida logo, é o maior risco de atraso — várias telas dependem do mesmo cálculo inexistente.
2. **Os cards de Benchmark e Oportunidade regional dependem de volume de dados de outras lojas.** No dia 1 de uma loja nova (ou da plataforma inteira, se o lançamento começar com poucos clientes), pode não existir "lojas parecidas" suficiente pra gerar esse card — precisa de um plano B (esconder o card? mostrar com aviso de "dado ainda limitado"?) que não foi desenhado.
3. **Pós-venda depende de uma fonte de dado (CRM de consumidor final) que nunca foi confirmada como parte do escopo técnico.** Se essa integração não existir, o módulo inteiro não tem o que mostrar — vale confirmar com o time técnico antes de desenhar essas telas, não depois.

---

## 4. Pendências já registradas em outros documentos (não duplicadas aqui)

Já sinalizadas em `auditoria-navegacao-lojista-desktop.md`, continuam valendo, só listadas aqui pra referência cruzada:
- Número de grades de tamanho e formato de integração com o ERP
- Taxonomia de tags dos insight cards (4 tipos sugeridos, critério de classificação pendente)
- Quantidade sugerida por tamanho no modal de reposição
