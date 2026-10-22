type Props = {
  texto: string
}

export function Carregando({ texto }: Props) {
  return (
    <div role="status" className="mb-3 flex items-center gap-2 text-[13px] text-suave">
      <span className="size-4 animate-spin rounded-full border-2 border-linha-forte border-t-botao" aria-hidden="true" />
      {texto}
    </div>
  )
}