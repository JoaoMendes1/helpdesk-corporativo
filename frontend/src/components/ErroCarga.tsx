import { Alerta } from './Alerta'

type Props = {
  mensagem: string
  aoTentarDeNovo: () => void
}

// Falha ao buscar os dados da tela, com a mensagem da API e o botão para repetir.
export function ErroCarga({ mensagem, aoTentarDeNovo }: Props) {
  return (
    <Alerta tipo="erro" titulo="Não foi possível carregar os dados.">
      {mensagem}{' '}
      <button type="button" onClick={aoTentarDeNovo} className="font-bold underline underline-offset-2">
        Tentar novamente
      </button>
    </Alerta>
  )
}