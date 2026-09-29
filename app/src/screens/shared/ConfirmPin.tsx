import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthShell } from '../../components/layout/AuthShell'
import { users } from '../../lib/data'

export function ConfirmPin() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const user = users.find((u) => u.id === userId) ?? users[1]
  const titular = users.find((u) => u.role === 'titular')!
  const [pin, setPin] = useState<number[]>([1, 2])

  useEffect(() => {
    if (pin.length === 4) navigate('/rep/radar')
  }, [pin, navigate])

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <AuthShell width={340} center>
      <div className="text-center mb-6">
        <div className="w-13 h-13 rounded-full bg-surface-3 flex items-center justify-center font-mono text-sm font-semibold text-text-primary mx-auto">
          {user.initials}
        </div>
        <h2 className="font-display text-xl font-bold text-text-primary mt-3.5">Oi, {user.name.split(' ')[0]}</h2>
        <div className="text-[12.5px] text-text-secondary mt-2 max-w-[220px] mx-auto leading-relaxed">
          Confirme seu PIN de 4 dígitos pra continuar como auxiliar de {titular.name.split(' ')[0]}
        </div>
      </div>

      <div className="flex justify-center gap-2.5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i < pin.length ? 'bg-black' : 'bg-border-strong'}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {keys.map((k, i) => (
          <button
            key={i}
            disabled={!k}
            onClick={() => {
              if (k === '⌫') setPin((p) => p.slice(0, -1))
              else if (k) setPin((p) => (p.length < 4 ? [...p, Number(k)] : p))
            }}
            className="aspect-square rounded-full bg-surface-2 border border-border flex items-center justify-center text-base text-text-primary disabled:opacity-0"
          >
            {k}
          </button>
        ))}
      </div>

      <div
        className="text-center text-[12.5px] text-text-secondary mt-6 cursor-pointer"
        onClick={() => navigate('/rep/radar')}
      >
        Esqueceu o PIN? <b className="text-text-primary">Entrar como {titular.name.split(' ')[0]}</b>
      </div>
    </AuthShell>
  )
}
