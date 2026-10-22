import type { ReactNode } from 'react'

type Props = {
  id: string
  rotulo: ReactNode
  erro?: string
  dica?: string
  obrigatorio?: boolean
  children: ReactNode
}

// Rótulo, campo, dica e a mensagem de erro, ligados pelo id.
export function Campo({ id, rotulo, erro, dica, obrigatorio, children }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[11.5px] font-bold uppercase tracking-wide text-texto-2">
        {rotulo}
        {obrigatorio && (
          <span className="text-erro-texto" aria-hidden="true">
            {' '}*
          </span>
        )}
      </label>
      {children}
      {dica && <p className="text-[12.5px] text-suave">{dica}</p>}
      {erro && <p className="text-[12.5px] text-erro-texto">{erro}</p>}
    </div>
  )
}
