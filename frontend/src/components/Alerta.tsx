import type { ReactNode } from 'react'

const CORES = {
  erro: 'border-erro-texto/30 bg-erro-fundo text-erro-texto',
  info: 'border-info-texto/30 bg-info-fundo text-info-texto',
  ok: 'border-ok-texto/30 bg-ok-fundo text-ok-texto',
}

type Props = {
  tipo: keyof typeof CORES
  titulo?: string
  children?: ReactNode
}

export function Alerta({ tipo, titulo, children }: Props) {
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] ${CORES[tipo]}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="mt-px flex-none">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div>
        {titulo && <b className="block">{titulo}</b>}
        {children}
      </div>
    </div>
  )
}