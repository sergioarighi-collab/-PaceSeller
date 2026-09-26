import { WebModal } from './WebModal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

// Confirmação genérica de "tem certeza?" com o mesmo WebModal usado no resto do app — usada hoje
// só pra avisar que editar um pedido "Aguardando Ana" reabre a aprovação (ver
// guia-dev-frontend.md), mas serve pra qualquer outro "isso muda algo, confirma?" que aparecer.
export function ConfirmModal({ title, message, confirmLabel = 'Continuar', cancelLabel = 'Cancelar', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <WebModal
      title={title}
      onClose={onCancel}
      width={420}
      footer={
        <>
          <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={onCancel}>
            {cancelLabel}
          </div>
          <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={onConfirm}>
            {confirmLabel}
          </div>
        </>
      }
    >
      <div style={{ padding: '8px 20px 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</div>
    </WebModal>
  )
}
