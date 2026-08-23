# Retail Performance Platform

Protótipo navegável (React + Vite + TypeScript) do fluxo **desktop do lojista** da Tesla Skate, com dados mock. CSS não é Tailwind — é extraído literalmente do mockup HTML de referência (`telas/telas-desktop-lojista.html`) pra fidelidade pixel a pixel.

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

- `src/lib` — tipos, dados mock e store (zustand) de sessão/carrinho.
- `src/components/desktop` — componentes compartilhados do fluxo desktop ativo (topnav, cards, sidebar etc.).
- `src/screens/lojista` — telas do fluxo desktop ativo (login → radar → catálogo → carrinho → pagamento).
- `src/styles/mockup.css` — CSS literal do mockup de referência.
- `src/components/ui`, `src/components/layout`, `src/screens/representante`, `src/screens/shared` — protótipo mobile anterior, não retrabalhado nesta leva.

Guia técnico completo (modelo de dados, convenções, regras de negócio, decisões e gaps conhecidos): [`../docs/guia-dev-frontend.md`](../docs/guia-dev-frontend.md).
