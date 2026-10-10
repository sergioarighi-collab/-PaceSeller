import { useState } from 'react'
import { WebModal } from './WebModal'

// Link de pagamento pro representante compartilhar com o lojista (set/2026, pedido do usuário:
// "após fechamento do carrinho, ele pode gerar um link e compartilhar com o lojista" — quem paga é
// o lojista, não a Ana, ver nota em `CarrinhoDetail.tsx`). O link é a própria URL da tela de
// pagamento (`/carrinhos/:cartId/:pedidoId/pagamento`) — não existe um domínio público nem conta
// por usuário nesse protótipo (um store só, sem backend), então "compartilhar" aqui é só copiar o
// link; abrir num outro aparelho/sessão de verdade não teria o mesmo estado. Documentado como
// limitação conhecida, não escondido do usuário.
export function PaymentLinkModal({ link, cartName, total, onClose }: { link: string; cartName: string; total: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard pode ser bloqueado (permissão, contexto não seguro) — o input readOnly abaixo
      // já deixa o link selecionável/copiável na mão como fallback, sem quebrar o fluxo.
    }
  }

  return (
    <WebModal
      title="Link de pagamento"
      subtitle={`${cartName} · ${total}`}
      onClose={onClose}
      width={440}
      footer={
        <div className="btn-primary" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }} onClick={handleCopy}>
          {copied ? 'Link copiado ✓' : 'Copiar link'}
        </div>
      }
    >
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
          Envie esse link pro lojista — ele escolhe a forma de pagamento e fecha o pedido direto, sem precisar passar os dados pra você.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '10px 12px',
          }}
        >
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              font: 'inherit',
              fontFamily: 'var(--mono)',
              fontSize: 11.5,
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>
    </WebModal>
  )
}
