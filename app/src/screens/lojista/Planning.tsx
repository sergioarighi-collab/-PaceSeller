import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DesktopPage } from '../../components/desktop/DesktopPage'
import { WebTopNav } from '../../components/desktop/WebTopNav'
import { Breadcrumb } from '../../components/desktop/Breadcrumb'
import { WebModal } from '../../components/desktop/WebModal'
import { ProductLineCard } from '../../components/desktop/ProductLineCard'
import { products, previousCollectionName, previousCollectionQty, collectionTitle } from '../../lib/data'
import { buildProductLines, deltaInfo } from '../../lib/productLines'
import { formatBRL } from '../../lib/format'
import { useAppStore } from '../../lib/store'

const lines = buildProductLines(products)
const zeroQtyByCollection = Object.fromEntries(lines.map((l) => [l.collection, 0]))

// Modelo real de planilha pra download — só o "ler o arquivo importado de volta" é simulado, isso aqui não é.
function downloadTemplateCsv() {
  const header = 'Linha de produto,Pares vendidos\n'
  const rows = lines.map((l) => `${collectionTitle[l.collection as keyof typeof collectionTitle]},0`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'modelo-colecao-anterior.csv'
  link.click()
  URL.revokeObjectURL(url)
}

type UploadStep = 'closed' | 'dropzone' | 'preview'

export function Planning() {
  const navigate = useNavigate()
  const status = useAppStore((s) => s.previousCollectionStatus)
  const importPreviousCollection = useAppStore((s) => s.importPreviousCollection)
  const skipPreviousCollection = useAppStore((s) => s.skipPreviousCollection)
  const resetPreviousCollection = useAppStore((s) => s.resetPreviousCollection)

  const [uploadStep, setUploadStep] = useState<UploadStep>('closed')
  const [fileName, setFileName] = useState<string | null>(null)

  const [qtyByCollection, setQtyByCollection] = useState<Record<string, number>>(
    status === 'imported' ? { ...previousCollectionQty } : zeroQtyByCollection,
  )

  function changeQty(collection: string, delta: number) {
    setQtyByCollection((s) => ({ ...s, [collection]: Math.max(0, (s[collection] ?? 0) + delta) }))
  }

  function prevQtyOf(collection: string) {
    return status === 'imported' ? (previousCollectionQty[collection] ?? 0) : 0
  }

  function closeUploadModal() {
    setUploadStep('closed')
    setFileName(null)
  }

  function handleSkip() {
    skipPreviousCollection()
    setQtyByCollection(zeroQtyByCollection)
  }

  function handleImportConfirmed() {
    importPreviousCollection()
    setQtyByCollection({ ...previousCollectionQty })
    closeUploadModal()
  }

  if (status === 'pending') {
    return (
      <DesktopPage>
        <WebTopNav />
        <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Catálogo', to: '/catalogo' }, { label: 'Planejar coleção' }]} />
        <div className="plan-empty">
          <div className="pe-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3v18h18" />
              <path d="m7 14 4-4 4 4 5-6" />
            </svg>
          </div>
          <h1>Você ainda não tem uma coleção anterior registrada</h1>
          <p>
            O Planejar compara quanto sua loja comprou na última coleção com o que você está planejando agora. Sem esse histórico,
            ainda dá pra planejar — só não tem com o que comparar.
          </p>
          <div className="pe-actions">
            <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => setUploadStep('dropzone')}>
              Importar vendas da coleção anterior
            </div>
            <button className="btn-text" onClick={handleSkip}>
              Começar do zero, sem comparação →
            </button>
          </div>
        </div>

        {uploadStep !== 'closed' && (
          <UploadModal
            step={uploadStep}
            fileName={fileName}
            onPickFile={() => setFileName('colecao-inverno-2025.csv')}
            onContinue={() => setUploadStep('preview')}
            onBack={() => setUploadStep('dropzone')}
            onClose={closeUploadModal}
            onConfirm={handleImportConfirmed}
          />
        )}
      </DesktopPage>
    )
  }

  function factoryPriceOf(line: (typeof lines)[number]) {
    return line.colors.find((c) => c.id === line.bestSellerId)?.priceFactory ?? line.colors[0].priceFactory
  }

  const prevTotalQty = lines.reduce((sum, l) => sum + prevQtyOf(l.collection), 0)
  const nowTotalQty = lines.reduce((sum, l) => sum + (qtyByCollection[l.collection] ?? 0), 0)
  const prevTotalVal = lines.reduce((sum, l) => sum + prevQtyOf(l.collection) * factoryPriceOf(l), 0)
  const nowTotalVal = lines.reduce((sum, l) => sum + (qtyByCollection[l.collection] ?? 0) * factoryPriceOf(l), 0)

  const qtyDelta = deltaInfo(prevTotalQty, nowTotalQty)
  const valDelta = deltaInfo(prevTotalVal, nowTotalVal)

  // Destaque no resumo: a linha que mais caiu vs. a coleção anterior, se a queda for relevante (>15%).
  const biggestDrop = lines
    .map((l) => {
      const prev = prevQtyOf(l.collection)
      const now = qtyByCollection[l.collection] ?? 0
      if (prev === 0) return null
      const pct = Math.round(((now - prev) / prev) * 100)
      return { collection: l.collection, pct }
    })
    .filter((x): x is { collection: string; pct: number } => x !== null && x.pct < -15)
    .sort((a, b) => a.pct - b.pct)[0]

  return (
    <DesktopPage>
      <WebTopNav />
      <Breadcrumb items={[{ label: 'Radar', to: '/radar' }, { label: 'Catálogo', to: '/catalogo' }, { label: 'Planejar coleção' }]} />

      {status === 'imported' ? (
        <div className="context-banner">
          <div className="cb-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3v18h18" />
              <path d="m7 14 4-4 4 4 5-6" />
            </svg>
          </div>
          <div>
            <div className="cb-title">Comparando com Coleção {previousCollectionName}</div>
            <div className="cb-sub">Última coleção fechada desta estação</div>
          </div>
          <div className="cb-clear" style={{ cursor: 'pointer' }} onClick={resetPreviousCollection}>
            Trocar coleção
          </div>
        </div>
      ) : (
        <div className="context-banner">
          <div className="cb-icon" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <div>
            <div className="cb-title">Planejando sem comparação</div>
            <div className="cb-sub">Nenhuma coleção anterior selecionada</div>
          </div>
          <div className="cb-clear" style={{ cursor: 'pointer' }} onClick={resetPreviousCollection}>
            Importar dados de vendas
          </div>
        </div>
      )}

      <div className="web-app-layout">
        <div className="web-content">
          <div style={{ marginTop: 16 }}>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>Planejar coleção</h1>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 580 }}>
              Cada linha mostra quanto você comprou na coleção anterior — ajuste a quantidade desta a partir daí, direto no card do
              catálogo.
            </div>
          </div>

          <div className="plan-summarybar" style={{ marginTop: 22 }}>
            <div className="cell">
              <div className="slabel">Pares — coleção anterior</div>
              <div className="sval">{prevTotalQty}</div>
            </div>
            <div className="cell">
              <div className="slabel">Pares — planejando agora</div>
              <div className="sval">{nowTotalQty}</div>
              {qtyDelta.tone !== 'new' && <div className={`sdelta ${qtyDelta.tone}`}>{qtyDelta.text} vs. anterior</div>}
            </div>
            <div className="cell">
              <div className="slabel">Investimento — anterior</div>
              <div className="sval" style={{ fontSize: 15.5 }}>
                {formatBRL(prevTotalVal)}
              </div>
            </div>
            <div className="cell">
              <div className="slabel">Investimento — agora</div>
              <div className="sval" style={{ fontSize: 15.5 }}>
                {formatBRL(nowTotalVal)}
              </div>
              {valDelta.tone !== 'new' && <div className={`sdelta ${valDelta.tone}`}>{valDelta.text} vs. anterior</div>}
            </div>
          </div>

          <div className="web-section-title">Linhas de produto</div>
          <div className="catgrid-web">
            {lines.map((line) => (
              <ProductLineCard
                key={line.collection}
                colors={line.colors}
                bestSellerId={line.bestSellerId}
                planning={{
                  prevQty: prevQtyOf(line.collection),
                  qty: qtyByCollection[line.collection] ?? 0,
                  onChangeQty: (delta) => changeQty(line.collection, delta),
                }}
              />
            ))}
          </div>
        </div>

        <div className="web-sidebar">
          <div className="stitle">Resumo do plano</div>
          <div className="stotal">{formatBRL(nowTotalVal)}</div>
          <div className="ssub">
            {nowTotalQty} pares · {lines.length} linhas
          </div>
          {biggestDrop && (
            <div className="bubble">
              <b>{collectionTitle[biggestDrop.collection as keyof typeof collectionTitle]}</b> caiu {Math.abs(biggestDrop.pct)}% vs. a
              coleção anterior — vale conferir se foi intencional antes de enviar.
            </div>
          )}
          <div className="sbtns">
            <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/carrinhos')}>
              Enviar plano ao carrinho
            </div>
          </div>
        </div>
      </div>

      {uploadStep !== 'closed' && (
        <UploadModal
          step={uploadStep}
          fileName={fileName}
          onPickFile={() => setFileName('colecao-inverno-2025.csv')}
          onContinue={() => setUploadStep('preview')}
          onBack={() => setUploadStep('dropzone')}
          onClose={closeUploadModal}
          onConfirm={handleImportConfirmed}
        />
      )}
    </DesktopPage>
  )
}

function UploadModal({
  step,
  fileName,
  onPickFile,
  onContinue,
  onBack,
  onClose,
  onConfirm,
}: {
  step: UploadStep
  fileName: string | null
  onPickFile: () => void
  onContinue: () => void
  onBack: () => void
  onClose: () => void
  onConfirm: () => void
}) {
  if (step === 'dropzone') {
    return (
      <WebModal
        title="Importar coleção anterior"
        subtitle="Uma planilha com duas colunas: o nome da linha de produto e quantos pares sua loja comprou dela"
        onClose={onClose}
        width={480}
        footer={
          <>
            <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={onClose}>
              Cancelar
            </div>
            <div
              className="btn-primary"
              style={fileName ? { cursor: 'pointer' } : { background: 'var(--surface-3)', color: 'var(--text-tertiary)' }}
              onClick={fileName ? onContinue : undefined}
            >
              Continuar
            </div>
          </>
        }
      >
        <div style={{ padding: '8px 20px 20px' }}>
          <div className="dropzone" onClick={onPickFile}>
            <div className="dz-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0-12 4 4m-4-4-4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <div className="dz-title">Arraste o arquivo aqui ou clique pra selecionar</div>
            <div className="dz-sub">.CSV ou .XLSX, até 5MB</div>
          </div>
          {fileName && (
            <div className="filerow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 3v4a1 1 0 0 0 1 1h4M6 3h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              </svg>
              <span className="fname">{fileName}</span>
              <span className="fsize">14 KB</span>
            </div>
          )}
          <div className="modelrow">
            Não tem a planilha pronta?{' '}
            <button type="button" onClick={downloadTemplateCsv}>
              Baixar modelo em branco
            </button>
          </div>
        </div>
      </WebModal>
    )
  }

  return (
    <WebModal
      title="Confira os dados antes de importar"
      subtitle="Reconhecemos a maioria das linhas automaticamente pelo nome — as que não bateram, você aponta manualmente"
      onClose={onClose}
      width={620}
      footer={
        <>
          <div className="btn-secondary" style={{ cursor: 'pointer' }} onClick={onBack}>
            Voltar
          </div>
          <div className="btn-primary" style={{ cursor: 'pointer' }} onClick={onConfirm}>
            Confirmar e usar esses dados
          </div>
        </>
      }
    >
      <div style={{ padding: '8px 20px 20px' }}>
        <div className="prev-summary">
          <span className="chip ok">6 linhas reconhecidas</span>
          <span className="chip warn">1 precisa de atenção</span>
        </div>
        <table className="plan-table">
          <thead>
            <tr>
              <th>Na planilha</th>
              <th>Pares vendidos</th>
              <th>Linha no catálogo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Coil</td>
              <td className="qty-cell">145</td>
              <td>Tênis Tesla Coil</td>
              <td>
                <span className="status-ok">✓ Reconhecida</span>
              </td>
            </tr>
            <tr>
              <td>Hertz</td>
              <td className="qty-cell">88</td>
              <td>Tênis Tesla Hertz</td>
              <td>
                <span className="status-ok">✓ Reconhecida</span>
              </td>
            </tr>
            <tr>
              <td>Hertz Art</td>
              <td className="qty-cell">0</td>
              <td>Tênis Tesla Hertz Art</td>
              <td>
                <span className="status-ok">✓ Reconhecida</span>
              </td>
            </tr>
            <tr>
              <td>Flow</td>
              <td className="qty-cell">52</td>
              <td>Tênis Tesla Flow</td>
              <td>
                <span className="status-ok">✓ Reconhecida</span>
              </td>
            </tr>
            <tr className="row-warn">
              <td>Flow-XL</td>
              <td className="qty-cell">34</td>
              <td>
                <select defaultValue="flowxl">
                  <option value="flowxl">Tênis Tesla Flow XL</option>
                  <option value="fusion">Tênis Tesla Fusion</option>
                  <option value="ignore">Ignorar esta linha</option>
                </select>
              </td>
              <td>
                <span className="status-warn">⚠ Confirmar</span>
              </td>
            </tr>
            <tr>
              <td>Fusion</td>
              <td className="qty-cell">0</td>
              <td>Tênis Tesla Fusion</td>
              <td>
                <span className="status-ok">✓ Reconhecida</span>
              </td>
            </tr>
            <tr>
              <td>TG II</td>
              <td className="qty-cell">20</td>
              <td>Tênis Tesla TG II</td>
              <td>
                <span className="status-ok">✓ Reconhecida</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </WebModal>
  )
}
