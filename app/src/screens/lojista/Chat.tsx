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

// Nome completo da Ana, só usado aqui (set/2026) — `cart.representative` guarda só "Ana" (usado em
// textos curtos pelo resto do app, ex: "Representante: Ana"), mas o chat do lado do lojista sempre
// mostrou o nome completo. Perdido por um instante ao tornar a tela ciente de persona (regressão
// pega testando do lado do lojista) — resgatado como constante pra não depender de `cart.representative`.
const ANA_NOME_COMPLETO = 'Ana Ferreira'

export function Chat() {
  const navigate = useNavigate()
  const { cartId } = useParams()
  const carrinhos = useAppStore((s) => s.carrinhos)
  const persona = useAppStore((s) => s.persona)
  const lojistas = useAppStore((s) => s.lojistas)
  const activeLojistaId = useAppStore((s) => s.activeLojistaId)
  const cart = carrinhos.find((c) => c.id === cartId) ?? carrinhos[0]
  const pedido = cart.pedido

  // Falar com o lojista (set/2026, pedido do usuário: "troca de mensagens com o lojista" — antes
  // essa tela só existia do ponto de vista dele, a Ana não tinha CTA nenhum pra chegar aqui). Mesmo
  // componente, ciente de persona: quando é ela quem olha, "a outra pessoa" vira o lojista ativo
  // (nome/avatar/texto do campo), não ela mesma. O roteiro de mensagens específico (pedido #4790,
  // Hertz Rose...) é o que já existia e continua só do lado do lojista — reescrever ele genérico pra
  // qualquer loja ia descaracterizar uma conversa que faz sentido pro contexto dela. Do lado da Ana,
  // a conversa é mais simples e usa o nome/carrinho reais (funciona pra qualquer loja da carteira).
  const lojistaAtivo = lojistas.find((l) => l.id === activeLojistaId)
  const outraPessoa = persona === 'representante' ? (lojistaAtivo?.contactName ?? cart.representative) : ANA_NOME_COMPLETO

  // Thread é um roteiro fixo (não é chat de verdade, não tem backend) — mensagens novas só se somam
  // localmente ao final, pra "Enviar" deixar de ser um botão decorativo sem virar um chat real (que
  // exigiria um backend que este protótipo não tem).
  const [myMessages, setMyMessages] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const threadEndRef = useRef<HTMLDivElement>(null)

  // .chat-thread tem altura fixa com scroll interno (não é a página toda que rola) — sem isso, a
  // própria mensagem que acabou de ser mandada fica invisível abaixo da dobra.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' })
  }, [myMessages])

  function sendMessage() {
    const text = draft.trim()
    if (!text) return
    setMyMessages((m) => [...m, text])
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
              <div className="chat-day">Hoje</div>

              {persona === 'representante' ? (
                // Roteiro genérico (set/2026) — diferente do roteiro específico abaixo (que
                // referencia pedido/produto de uma loja em particular), esse precisa funcionar pra
                // QUALQUER lojista da carteira da Ana, não só Radical Skate — por isso usa só nome e
                // carrinho reais, sem inventar número de pedido ou produto específico.
                <>
                  <div className="msg-row">
                    <div className="msg-avatar">{iniciais(outraPessoa)}</div>
                    <div>
                      <div className="msg-bubble">Oi Ana, bom dia!</div>
                      <div className="msg-time">09:12</div>
                    </div>
                  </div>

                  <div className="msg-row mine">
                    <div className="msg-avatar">AN</div>
                    <div>
                      <div className="msg-bubble">Bom dia, {outraPessoa.split(' ')[0]}! Alguma dúvida sobre o carrinho "{cart.name}"?</div>
                      <div className="msg-time">09:13</div>
                    </div>
                  </div>

                  <div className="msg-row">
                    <div className="msg-avatar">{iniciais(outraPessoa)}</div>
                    <div
                      className="msg-context-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/carrinhos/${cart.id}`)}
                    >
                      <div className="mc-label">Pedido referenciado</div>
                      <div className="mc-title">
                        {cart.name} — {pedido.label} · {formatBRL(pedido.total)}
                      </div>
                    </div>
                    <div className="msg-time">09:14</div>
                  </div>

                  <div className="msg-row">
                    <div className="msg-avatar">{iniciais(outraPessoa)}</div>
                    <div>
                      <div className="msg-bubble">Vou dar uma olhada com calma e te aviso.</div>
                      <div className="msg-time">09:14</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="msg-row">
                    <div className="msg-avatar">AN</div>
                    <div>
                      <div className="msg-bubble">
                        Bom dia, Carlos! Vi que o pedido #4790 atrasou — já cobrei a fábrica, deve normalizar até amanhã.
                      </div>
                      <div className="msg-time">09:12</div>
                    </div>
                  </div>

                  <div className="msg-row mine">
                    <div className="msg-avatar">CA</div>
                    <div>
                      <div className="msg-bubble">Valeu por avisar! E sobre o carrinho da Coleção Inverno, a Hertz Rose que eu queria pagar à vista?</div>
                      <div className="msg-time">09:15</div>
                    </div>
                  </div>

                  <div className="msg-row">
                    <div className="msg-avatar">AN</div>
                    <div>
                      <div className="msg-bubble">
                        Dá pra fazer isso direto na hora de pagar — você pode dividir o pagamento do pedido, uma parte à vista
                        pra Hertz Rose e o resto no prazo normal. Dá uma olhada quando puder.
                      </div>
                      <div className="msg-time">09:16</div>
                    </div>
                  </div>

                  <div className="msg-row">
                    <div className="msg-avatar">AN</div>
                    <div
                      className="msg-context-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/carrinhos/${cart.id}`)}
                    >
                      <div className="mc-label">Pedido referenciado</div>
                      <div className="mc-title">
                        {cart.name} — {pedido.label} · {formatBRL(pedido.total)}
                      </div>
                    </div>
                    <div className="msg-time">09:16</div>
                  </div>

                  <div className="msg-row mine">
                    <div className="msg-avatar">CA</div>
                    <div>
                      <div className="msg-bubble">Perfeito, faz sentido. Pode confirmar assim mesmo.</div>
                      <div className="msg-time">09:41</div>
                    </div>
                  </div>
                </>
              )}

              {myMessages.map((text, i) => (
                <div className="msg-row mine" key={i}>
                  <div className="msg-avatar">{persona === 'representante' ? 'AN' : 'CA'}</div>
                  <div>
                    <div className="msg-bubble">{text}</div>
                    <div className="msg-time">agora</div>
                  </div>
                </div>
              ))}
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
