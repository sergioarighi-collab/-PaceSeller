import { useNavigate } from 'react-router-dom'
import { RepTopNav } from './RepTopNav'
import { useAppStore, lojistaComprasMes } from '../../lib/store'
import { formatBRL } from '../../lib/format'

// Paleta de "selo de marca" por loja (set/2026) — não existe logo de verdade no mock, então cada
// loja ganha uma cor fixa (ciclada pela posição na lista) pra ajudar a reconhecer o quadradinho de
// relance, sem fingir ser uma imagem real. Cores propositalmente escuras/neutras (não são tone-risk/
// info/positive do resto do app): aqui não é sobre severidade, é só identidade visual da loja.
const LOGO_PALETTE = [
  { bg: '#1C2B4A', fg: '#E8EDFB' },
  { bg: '#174A3A', fg: '#E3F5EC' },
  { bg: '#5C2A1D', fg: '#FBE9E1' },
  { bg: '#3A2D5C', fg: '#EDE7FB' },
]

function iniciais(name: string): string {
  const palavras = name.trim().split(/\s+/)
  return palavras.length === 1 ? palavras[0].slice(0, 2).toUpperCase() : (palavras[0][0] + palavras[1][0]).toUpperCase()
}

// "Modo loja" (set/2026) — quando o representante entra no Catálogo sem vir de uma ação do Radar
// (que já escolhe o lojista automaticamente via `enterLojista`), ele precisa escolher qual loja vai
// atender antes de ver o catálogo.
//
// Redesign (set/2026, pedido do usuário): a primeira versão reaproveitava o mesmo `.web-icard`
// colorido por severidade que o Radar usa — e depois que o Radar ganhou o banner de oportunidade e
// a visão "Carrinhos" com ícones coloridos, o usuário notou que a Gate "está muito parecido com o
// radar podendo confundir o usuário". Trocado por uma lista de linhas horizontais, neutra (sem
// tone-risk/info/positive — aqui não é sobre agir em cima de um sinal, é só escolher a loja), com
// o dado que o usuário pediu: "valor total de compras no mês" (ver `lojistaComprasMes` em
// store.ts). O texto do sinal (`topLojistaSinal`) saiu da Gate de propósito — ficou só no Radar, que
// é quem executa ação em cima dele; aqui mostrar o motivo de cada loja de novo seria repetir
// informação e ia contra o "não quero que fique muita informação que... se percam" do usuário.
//
// Dois testes de mockup antes de implementar (ver histórico/guia-dev-frontend.md): o primeiro tinha
// "Entrar na loja →" por extenso do lado do valor em R$ — usuário achou que os dois competiam
// visualmente ("não gostei do 'entrar na loja' perto dos valores de vendas"). Trocado por só uma
// seta (›) separada por uma linha vertical, padrão de item de lista clicável — a linha inteira
// continua clicável, a seta só reforça visualmente que dá pra entrar.
export function LojistaGate() {
  const navigate = useNavigate()
  const lojistas = useAppStore((s) => s.lojistas)
  const enterLojista = useAppStore((s) => s.enterLojista)

  function escolherLoja(lojistaId: string) {
    enterLojista(lojistaId)
    navigate('/catalogo')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <RepTopNav />
      <div className="web-main">
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Qual loja você vai atender agora?
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          O catálogo, a grade mínima e o carrinho vão ser dessa loja até você trocar
        </div>

        <div className="gate-list">
          {lojistas.map((lojista, i) => {
            const compras = lojistaComprasMes(lojista)
            const logo = LOGO_PALETTE[i % LOGO_PALETTE.length]
            return (
              <div className="gate-row" key={lojista.id} onClick={() => escolherLoja(lojista.id)}>
                <div className="gate-logo" style={{ background: logo.bg, color: logo.fg }}>
                  {iniciais(lojista.name)}
                </div>
                <div className="gate-info">
                  <div className="gate-name">{lojista.name}</div>
                  <div className="gate-meta">
                    {lojista.city} · {lojista.contactName}
                  </div>
                </div>
                <div className="gate-stat">
                  <div className="gate-valor">{formatBRL(compras)}</div>
                  <div className="gate-valor-sub">{compras > 0 ? 'comprado este mês' : 'nenhuma compra este mês'}</div>
                </div>
                <div className="gate-divider" />
                <div className="gate-chevron">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
