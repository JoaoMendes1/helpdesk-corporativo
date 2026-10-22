import type { ReactNode } from 'react'

type Props = {
  secao: string
  titulo: string
  subtitulo: string
  acao?: ReactNode
}

// Topo de cada tela: a seção, o título, a explicação e, se houver, o botão principal.
export function CabecalhoPagina({ secao, titulo, subtitulo, acao }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-5 gap-y-3 border-b border-linha pb-4">
      <div>
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-marca-texto">{secao}</p>
        <h1 className="text-[26px] font-semibold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-[13px] text-suave">{subtitulo}</p>
      </div>
      {acao}
    </div>
  )
}