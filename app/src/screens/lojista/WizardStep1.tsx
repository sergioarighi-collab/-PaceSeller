import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardShell } from '../../components/desktop/OnboardShell'

const segmentos = ['Streetwear', 'Casual', 'Esportivo', 'Feminino']
const portes = ['Pequena', 'Média', 'Grande']
const publicos = ['Jovem adulto', 'Teen', 'Adulto', 'Família']
// Perguntas qualitativas que nem Pace Stock nem histórico de pedidos respondem sozinhos — moradas
// aqui (não na Etapa 2) porque são dado cadastral da loja, não dado de vendas (set/2026).
const diferenciais = ['Atendimento especializado', 'Preço competitivo', 'Variedade de marcas', 'Localização', 'Presença digital forte']
const canaisVenda = ['Só loja física', 'Loja física + redes sociais', 'Loja física + e-commerce próprio', 'Também vendo em marketplace']

export function WizardStep1() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('Radical Skate')
  const [segmento, setSegmento] = useState('Streetwear')
  const [porte, setPorte] = useState('Média')
  const [publico, setPublico] = useState<string[]>(['Jovem adulto', 'Teen'])
  const [diff, setDiff] = useState<string[]>(['Atendimento especializado'])
  const [canais, setCanais] = useState<string[]>(['Loja física + redes sociais'])

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  return (
    <OnboardShell step={1}>
      <div className="omhead">
        <h2>Perfil da loja</h2>
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
            <div className="flabel">
              Porte da loja
              <span
                className="finfo-icon"
                title="Baseado no faturamento anual — mesma referência usada pela Receita Federal: até R$ 4,8 milhões é pequena (ME/EPP), até R$ 300 milhões é média, acima disso é grande."
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-5M12 8h.01" />
                </svg>
              </span>
            </div>
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
                onClick={() => toggle(publico, setPublico, p)}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="fieldgroup">
          <div className="flabel">O que mais diferencia sua loja</div>
          <div className="chipselect">
            {diferenciais.map((d) => (
              <div
                key={d}
                className={`chip ${diff.includes(d) ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggle(diff, setDiff, d)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <div className="fieldgroup">
          <div className="flabel">Como você vende hoje</div>
          <div className="chipselect">
            {canaisVenda.map((c) => (
              <div
                key={c}
                className={`chip ${canais.includes(c) ? 'selected' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggle(canais, setCanais, c)}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <div className="btn-primary" style={{ width: 180, cursor: 'pointer' }} onClick={() => navigate('/onboarding/vendas')}>
            Continuar
          </div>
        </div>
      </div>
    </OnboardShell>
  )
}
