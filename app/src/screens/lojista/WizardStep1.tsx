import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardShell } from '../../components/desktop/OnboardShell'

const segmentos = ['Streetwear', 'Casual', 'Esportivo', 'Feminino']
const portes = ['Pequena', 'Média', 'Grande']
const publicos = ['Jovem adulto', 'Teen', 'Adulto', 'Família']

export function WizardStep1() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('Radical Skate')
  const [segmento, setSegmento] = useState('Streetwear')
  const [porte, setPorte] = useState('Média')
  const [publico, setPublico] = useState<string[]>(['Jovem adulto', 'Teen'])

  function togglePublico(p: string) {
    setPublico((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))
  }

  return (
    <OnboardShell step={1}>
      <div className="omhead">
        <h2>Dados básicos da loja</h2>
        <div className="omsub">Essas informações alimentam o Radar Comercial e a curva de tamanhos sugerida no catálogo.</div>
      </div>
      <div className="onboard-form">
        <div className="fieldgroup">
          <div className="flabel">Nome da loja</div>
          <input className="textinput" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="fieldrow2">
          <div className="fieldgroup">
            <div className="flabel">Segmento</div>
            <div className="chipselect">
              {segmentos.map((s) => (
                <div
                  key={s}
                  className={`chip ${segmento === s ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSegmento(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="fieldgroup">
            <div className="flabel">Porte da loja</div>
            <div className="chipselect">
              {portes.map((p) => (
                <div
                  key={p}
                  className={`chip ${porte === p ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setPorte(p)}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fieldgroup">
          <div className="flabel">Região</div>
          <div className="selectrow" style={{ maxWidth: 400 }}>
            <span>Porto Alegre, RS · Rua de comércio</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        <div className="fieldgroup">
          <div className="flabel">Público-alvo</div>
          <div className="chipselect">
            {publicos.map((p) => (
              <div
                key={p}
                className={`chip ${publico.includes(p) ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => togglePublico(p)}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <div className="btn-secondary" style={{ width: 180, cursor: 'pointer' }} onClick={() => navigate('/onboarding/vendas')}>
            Pular por agora
          </div>
          <div className="btn-primary" style={{ width: 180, cursor: 'pointer' }} onClick={() => navigate('/onboarding/vendas')}>
            Continuar
          </div>
        </div>
      </div>
    </OnboardShell>
  )
}
