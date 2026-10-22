import type { ReactNode } from 'react'

type Props = {
  titulo: string
  texto: string
  children?: ReactNode
}

// Lista sem itens: diz por que está vazia e, se houver, o que fazer.
export function Vazio({ titulo, texto, children }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-linha-forte bg-superficie px-5 py-12 text-center text-suave">
      <h3 className="mb-1.5 text-base font-bold text-texto">{titulo}</h3>
      <p>{texto}</p>
      {children && <div className="mt-3.5">{children}</div>}
    </div>
  )
}