# Pace Seller — Retail Performance Platform

Protótipo navegável (React + Vite + TypeScript) do fluxo desktop da Tesla Skate — fluxo do **lojista** (completo, PR #2 mergeada na main em set/2026) e, a partir daí, o fluxo do **representante** (em construção: mesma lógica do lojista, adaptada pra quem vende pra vários lojistas). Dados mock, sem backend real.

## Convenção obrigatória: documentação pro dev frontend

**Sempre que uma feature/tela for criada ou alterada de forma relevante, atualize `docs/guia-dev-frontend.md`** (estrutura, modelo de dados, componentes, regras de negócio, decisões e gaps conhecidos) antes de considerar a tarefa concluída. Isso vale mesmo quando o pedido do usuário não menciona documentação — é um passo padrão do fluxo de trabalho neste projeto, não uma tarefa à parte.

## Onde estão as coisas

- `app/` — o código do protótipo (ver `docs/guia-dev-frontend.md` pra estrutura interna).
- `docs/` — documentação de produto/negócio (fluxos, auditorias, requisitos) e o guia técnico pro dev frontend.
- `telas/` — mockup HTML de referência (fonte visual de verdade para o CSS em `app/src/styles/mockup.css`).
- `wireflow/` — wireframes/fluxo original.

## Branch

O fluxo do lojista foi concluído em `claude/new-session-6ecqg0` e mergeado na `main` (PR #2). A partir de set/2026, o trabalho do fluxo do **representante** vai em `claude/representante` (criado a partir da `main` já atualizada), com push direto.
