# Retail Performance Platform — Fluxo de Usuário e Requisitos de Front-end
## Etapa: Planejamento · Carrinho (Multi-pedido) · Pagamento · Confirmação · Acompanhamento · Chat — Perfil Lojista — Desktop/Web

> Este documento cobre os módulos construídos após o Catálogo Inteligente, que não tinham documentação de fluxo/requisitos equivalente até agora. Segue o mesmo formato dos dois documentos anteriores (`fluxo-e-requisitos-lojista-desktop.md` e `fluxo-catalogo-inteligente-desktop.md`) — leia-os primeiro se ainda não leu, porque os conceitos de sidebar persistente, nudges e breadcrumb já foram explicados lá e não repito aqui.

---

## 1. O modelo de dados que estas telas assumem (leia antes de tudo)

Esta é a peça mais importante deste documento — **mudou depois que os primeiros protótipos de Carrinho foram desenhados**, então se você (dev) olhar versões antigas do Figma/mockup, desconsidere a hierarquia de 2 níveis. A hierarquia correta é:

```
Lojista
  └─ Carrinho — compartilhado com o representante fixo da loja (não muda por carrinho)
       └─ Pedido — um ou mais por carrinho; existe mais de um quando o lojista
            precisa dividir por prazo de entrega e/ou condição de pagamento diferentes
```

- Um **Carrinho** pode ter 1 pedido (caso mais comum) ou vários.
- **Pagamento e Confirmação acontecem por Pedido**, não pelo carrinho inteiro — se um carrinho tem 2 pedidos, são 2 fluxos de pagamento separados, em momentos possivelmente diferentes.
- O **compartilhamento com o representante** acontece no nível do Carrinho (toda a conversa/aprovação é vista por ele ali), não duplicado por pedido.
- Isso **não vale pro representante** — quando desenharmos o perfil dele, a hierarquia ganha mais um nível acima (Representante → Cliente → Carrinho → Pedido), porque um representante atende vários lojistas. Não reaproveitar componentes de lista do lojista sem revisar essa diferença.

---

## 2. Fluxo completo desta leva

```
Catálogo / Ficha de Decisão
        │
        ├──→ "Adicionar ao carrinho" (direto)
        └──→ "Adicionar ao planejamento"
                    ↓
              8. Planejamento da Compra
                    ↓ "Enviar ao carrinho"
        [ ambos convergem em ]
                    ↓
              9. Meus Carrinhos (lista)
                    ↓ "Abrir"
              10. Carrinho (mostra 1+ pedidos agrupados)
                    │
        ┌───────────┼───────────────┬─────────────────┬──────────────┐
        ▼           ▼               ▼                 ▼              ▼
  "Ir para      "Salvar        "Criar novo      "Falar com      (por pedido)
  pagamento"    carrinho como   pedido neste      Ana" → 14.     "Ir para
  (por pedido)  rascunho"       carrinho"         Chat           pagamento"
        │
        ▼
  11. Pagamento (de 1 pedido específico)
        ▼
  12. Pedido Confirmado (desse pedido)
        ▼
  13. Acompanhamento (desse pedido) ──→ "Falar com Ana" → 14. Chat
```

**Pontos de atenção nesse fluxo:**
- Depois de confirmar um pedido, o **carrinho continua existindo** se ainda tiver outro pedido em aberto — a pessoa não "sai" do carrinho, ela volta pra lista de Meus Carrinhos ou continua vendo o outro pedido pendente.
- "Falar com Ana" existe em pelo menos 2 pontos (Acompanhamento e, potencialmente, de qualquer tela com o sidebar de contexto) — é a mesma tela de chat, não telas diferentes por origem. O que muda é o **card de contexto** que aparece dentro da conversa quando ela é aberta a partir de um pedido específico.

---

## 3. Requisitos por tela

### 8. Planejamento da Compra
- Layout de 2 colunas (conteúdo + sidebar), igual Catálogo/Ficha de Decisão — reaproveita o mesmo `web-sidebar`.
- Barra de mix (`mixbar`) é só leitura visual — os 3 segmentos (Tênis/Botas/Sandálias, por tipo de calçado, já que o cliente não vende acessórios/vestuário) recalculam conforme os itens do mix mudam de quantidade, mas a pessoa não edita o percentual diretamente, edita quantidade por item e o percentual é derivado.
- Steppers de quantidade por item: **mesma lógica de recálculo em tempo real** que já existe no modal "Ajustar reposição" (giro previsto, margem, cobertura na parte de cima da tela precisam atualizar ao vivo conforme o stepper muda).
- "Enviar ao carrinho": cria um novo carrinho (ou adiciona a um carrinho já em rascunho? **não está definido** — precisa decidir com produto se o Planejamento sempre cria carrinho novo ou pergunta) e navega pra tela de Carrinho.
- "Salvar como rascunho" (sidebar): salva o planejamento em si (diferente de salvar o carrinho) — **esses são dois conceitos de rascunho diferentes que podem confundir**, vale alinhar nomenclatura com produto antes de implementar.

### 9. Meus Carrinhos
- Cada card mostra: nome do carrinho, quantos pedidos tem dentro, status agregado (se todos os pedidos internos estão confirmados, mostra "confirmado"; se pelo menos 1 está em rascunho, mostra "rascunho" — **regra de agregação de status entre pedidos de um mesmo carrinho não está 100% definida**, o mockup assume "o status mais 'incompleto' prevalece" mas isso precisa validação).
- "Criar novo carrinho" → vai pro Catálogo (ponto de entrada padrão pra começar a comprar).

### 10. Carrinho (multi-pedido)
- Cada "grupo de pedido" (`ordergroup`) é uma seção fechada dentro da mesma tela — **os itens não se movem automaticamente entre grupos**, o lojista escolhe onde cada item vai (via "Criar novo pedido neste carrinho" e alguma forma de mover item, que **ainda não foi desenhada em detalhe** — o mockup mostra o resultado final, não a interação de arrastar/mover item entre pedidos).
- `cartswitcher` no topo troca entre **carrinhos diferentes** (não entre pedidos do mesmo carrinho — isso é uma fonte comum de confusão, reforçar no front que são conceitos de navegação diferentes: abas = carrinhos, cards internos = pedidos).
- Cada `ordergroup` tem seu próprio botão "Ir para pagamento" — isso navega pra tela de Pagamento **já filtrada pra aquele pedido específico**, não pro carrinho inteiro.
- `qualitybox` ("Antes de fechar") é do **carrinho inteiro**, não por pedido — os critérios (mix balanceado, categoria sub-representada) fazem mais sentido olhando o conjunto todo dos itens.
- `activitynote` (comentário do representante) também é do carrinho inteiro nesta versão — se o representante quiser comentar sobre um pedido específico, isso **não está diferenciado visualmente ainda**.

### 11. Pagamento
- Escopo de **um pedido só** — o valor mostrado, os itens, tudo é filtrado pro pedido que originou a navegação (via `?pedido=` na URL, ou equivalente).
- Sidebar mostra contexto do carrinho como um todo (quantos outros pedidos existem, se algum ainda está em rascunho) — isso é só informativo, não editável dessa tela.
- Mesmos itens não cobertos do documento anterior continuam valendo aqui: tela de "criar nova senha", fluxo de OAuth, etc. não se aplicam a este módulo.

### 12. Pedido Confirmado
- Número do pedido no mockup usa o formato `#4821-1` (id do carrinho + índice do pedido) — **isso é uma sugestão de formato, não uma decisão de backend**, o ID real pode ser estruturado diferente.
- "Voltar ao radar" e "Acompanhar pedido" são os 2 destinos — sem terceira opção "ver outro pedido deste carrinho" nesta tela (a pessoa precisaria voltar pro carrinho pra isso).

### 13. Acompanhamento do Pedido
- Timeline (`timeline`/`tstep`) é por pedido — se o carrinho tem 2 pedidos, cada um tem sua própria timeline/tela de acompanhamento, não uma visão combinada.
- Sidebar sinaliza se existe outro pedido do mesmo carrinho ainda pendente, com um link de volta pro carrinho completo.
- "Falar com Ana" → 14. Chat.

### 14. Falar com o Representante (Chat)
- Histórico de mensagens simples (sem "não lida"/"lida" definido, sem indicador de digitação — **nenhum desses estados foi desenhado**, considerar se são necessários no MVP antes de especificar).
- `msg-context-card` (o card que aparece dentro de uma mensagem referenciando um pedido) é clicável e leva pra aquele pedido/carrinho — **precisa ficar claro no front que isso é um link, não só um card decorativo**.
- Como o representante é sempre o mesmo por loja, **esta tela não tem lista de conversas** — é sempre a conversa com aquela pessoa. Isso muda completamente quando desenharmos o lado do representante (ele conversa com vários lojistas, então a tela dele precisa de uma lista de conversas antes do chat em si).
- Campo de digitação (`chat-input`) e envio (`chat-send`) — comportamento de envio em tempo real (WebSocket?) vs. polling **não foi definido**, é decisão técnica do time de backend/front, não teve influência no design.

---

## 4. O que NÃO está coberto por esta leva

- Interação de mover um item entre pedidos dentro do mesmo carrinho (só o resultado final foi desenhado)
- Regra de agregação de status entre pedidos de um mesmo carrinho (qual status "vence" na lista de Meus Carrinhos)
- Diferenciação entre "rascunho do planejamento" e "rascunho do carrinho" (nomenclatura a alinhar)
- Estados de mensagem no chat (lida/não lida, digitando, envio em tempo real vs. polling)
- Tudo que já estava listado como pendente nos dois documentos anteriores e ainda não foi resolvido (ver `auditoria-navegacao-lojista-desktop.md` pro status mais atualizado dessas pendências — recuperação de senha, taxonomia de tags, grade/ERP)
