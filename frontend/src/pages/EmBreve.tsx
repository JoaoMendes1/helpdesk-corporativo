type Props = {
  titulo: string
}

// Lugar das telas que entram numa próxima etapa.
export function EmBreve({ titulo }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="mt-1 text-suave">Esta tela está em construção.</p>
    </div>
  )
}