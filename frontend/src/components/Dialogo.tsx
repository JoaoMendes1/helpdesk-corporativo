import { useEffect, useId, type ReactNode } from 'react'

type Props = {
  titulo: string
  aoFechar: () => void
  // Enquanto o pedido é enviado, a janela não fecha: a decisão seria gravada mesmo assim.
  bloqueado?: boolean
  rodape: ReactNode
  children: ReactNode
}

// Janela de confirmação sobre a tela, no mesmo padrão do painel lateral do equipamento.
export function Dialogo({ titulo, aoFechar, bloqueado = false, rodape, children }: Props) {
  const idTitulo = useId()

  // A tecla Esc fecha a janela.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape' && !bloqueado) aoFechar()
    }

    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar, bloqueado])

  function fechar() {
    if (!bloqueado) aoFechar()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-texto/45" onClick={fechar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="fixed inset-0 z-50 m-auto h-fit max-h-[calc(100vh-48px)] w-[min(520px,calc(100vw-32px))] overflow-y-auto rounded-[14px] bg-superficie shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-linha px-5 py-4">
          <h2 id={idTitulo} className="text-[17px] font-bold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={fechar}
            disabled={bloqueado}
            aria-label="Fechar"
            className="ml-auto grid size-8 flex-none place-items-center rounded-lg border border-linha bg-superficie-2 text-lg text-suave hover:border-erro-texto hover:text-erro-texto disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-3.5 px-5 py-4.5">{children}</div>
        <div className="flex justify-end gap-2.5 border-t border-linha px-5 py-3.5">{rodape}</div>
      </div>
    </>
  )
}
