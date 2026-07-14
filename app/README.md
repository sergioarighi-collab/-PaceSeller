# Retail Performance Platform

Protótipo navegável (React + Vite + TypeScript + Tailwind) das interfaces de **lojista** e **representante** da Retail Performance Platform, com dados mock e adaptação responsiva mobile → tablet.

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

- `src/lib` — tipos, dados mock e store (zustand) de sessão/persona.
- `src/components/ui` — design system (botões, chips, cards, timeline etc.), fiel aos tokens de `telas/*.html`.
- `src/components/layout` — shells de navegação (bottom nav mobile / rail lateral tablet) e de autenticação (tela cheia mobile / cartão centralizado tablet).
- `src/screens/lojista`, `src/screens/representante`, `src/screens/shared` — telas de cada fluxo; telas de convergência (carrinho, acompanhamento de pedido) ficam em `shared` com lógica condicional por persona.
