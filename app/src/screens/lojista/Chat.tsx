import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { PersonaTopNav } from '../../components/desktop/PersonaTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { useAppStore } from '../../lib/store'
import { formatBRL } from '../../lib/format'

function iniciais(name: string): string {
  const palavras = name.trim().split(/\s+/)
  return palavras.length === 1 ? palavras[0].slice(0, 2).toUpperCase() : (palavras[0][0] + palavras[1][0]).toUpperCase()
}

export function Chat() {
  const navigate = useNavigate()
  const { cartId } = useParams()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const persona = useAppStore((s) => s.persona)
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const adicionarComentario = useAppStore((s) => s.adicionarComentario)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido

  // Falar com o lojista (set/2026, pedido do usuário: "troca de mensagens com o lojista") — mesmo
  // componente, ciente de persona: quando é ela quem olha, "a outra pessoa" vira o lojista ativo
  // (nome/avatar/texto do campo), não ela mesma.
  const lojistaAtivo = lojistas.find((l) => l.id === activeLojistaId)
  const outraPessoa = persona === 'representante' ? (lojistaAtivo?.contactName ?? cart.representative) : 'Ana Ferreira'

  // Chat de verdade (nov/2026, substituiu o roteiro fixo por persona que existia aqui antes — cada
  // lado tinha sua própria história hardcoded, e o que cada um digitava ficava só na própria tela,
  // nunca aparecia pro outro). Agora lê/escreve em `cart.comments` (ver `adicionarComentario` em
  // store.ts) — a MESMA thread que aparece resumida no Detalhe do Carrinho e em Meus Carrinhos, não
  // um histórico paralelo. Sem mensagem nenhuma ainda (a maioria dos carrinhos nasce sem nenhum
  // comentário no mock), a tela começa vazia — comportamento correto de um chat de verdade, não um
  // problema a esconder com texto inventado.
  const comments = cart.comments ?? []
  const [draft, setDraft] = useState('')
  const threadEndRef = useRef<HTMLDivElement>(null)

  // .chat-thread tem altura fixa com scroll interno (não é a página toda que rola) — sem isso, a
  // própria mensagem que acabou de ser mandada fica invisível abaixo da dobra.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' })
  }, [comments.length])

  function sendMessage() {
    const text = draft.trim()
    if (!text) return
    adicionarComentario(cart.id, text)
    setDraft('')
  }

  return (
    <DesktopPage>
      <PersonaTopNav />
      <Breadcrumb
        items={
          persona === 'representante'
            ? [
                { label: 'Radar', to: '/rep/radar' },
                { label: pedido.label, to: `/carrinhos/${cart.id}` },
                { label: `Falar com ${outraPessoa}` },
              ]
            : [
                { label: 'Radar', to: '/radar' },
                { label: 'Carrinhos', to: '/carrinhos' },
                { label: pedido.label, to: `/carrinhos/${cart.id}` },
                { label: `Falar com ${outraPessoa}` },
              ]
        }
      />
      <div className="web-app-layout">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chat-shell">
            <div className="chat-header">
              <div className="ch-avatar">{iniciais(outraPessoa)}</div>
              <div>
                <div className="ch-name">{outraPessoa}</div>
                <div className="ch-status">
                  <span className="dot" />
                  {persona === 'representante' ? `Online agora · ${lojistaAtivo?.name ?? 'contato da loja'}` : 'Online agora · sua representante'}
                </div>
              </div>
            </div>

            <div className="chat-thread">
              <div
                className="msg-context-card"
                style={{ cursor: 'pointer', margin: '0 0 14px' }}
                onClick={() => navigate(`/carrinhos/${cart.id}`)}
              >
                <div className="mc-label">Conversa sobre</div>
                <div className="mc-title">
                  {cart.name} — {pedido.label} · {formatBRL(pedido.total)}
                </div>
              </div>

              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-tertiary)', padding: '24px 0' }}>
                  Nenhuma mensagem ainda — escreva a primeira.
                </div>
              ) : (
                <>
                  <div className="chat-day">Conversa</div>
                  {comments.map((comment) => {
                    const mine = comment.by === persona
                    return (
                      <div className={`msg-row ${mine ? 'mine' : ''}`} key={comment.id}>
                        <div className="msg-avatar">{iniciais(comment.author)}</div>
                        <div>
                          <div className="msg-bubble">{comment.text}</div>
                          <div className="msg-time">{comment.timeLabel}</div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
              <div ref={threadEndRef} />
            </div>

            <div className="chat-inputbar">
              <input
                className="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Escreva uma mensagem para ${outraPessoa}...`}
                style={{ border: 'none', outline: 'none', font: 'inherit', color: 'inherit' }}
              />
              <div className="chat-send" style={{ cursor: 'pointer' }} onClick={sendMessage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 3 18 9-18 9V3Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Sobre {outraPessoa}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <div className="ch-avatar" style={{ width: 44, height: 44 }}>
              {iniciais(outraPessoa)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{outraPessoa}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                {persona === 'representante' ? `${lojistaAtivo?.name ?? 'Loja'} · ${lojistaAtivo?.city ?? ''}` : 'Representante desde 2022'}
              </div>
            </div>
          </div>
          {persona !== 'representante' && <div className="bubble">Responde normalmente em até 2 horas em dias úteis</div>}
          <div className="sbtns">
            <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={() => navigate(`/carrinhos/${cart.id}`)}>
              Ver carrinho {cart.name}
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  )
}
