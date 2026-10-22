import { useEffect, useState } from 'react'
import { Alerta } from '../components/Alerta'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { CartaoSolicitacao } from '../components/CartaoSolicitacao'
import { Carregando } from '../components/Carregando'
import { DialogoDecisao } from '../components/DialogoDecisao'
import { ErroCarga } from '../components/ErroCarga'
import { Vazio } from '../components/Vazio'
import { requisitar } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_BOTAO_SECUNDARIO } from '../lib/estilos'
import type { Solicitacao } from '../tipos'

type Decisao = {
  solicitacao: Solicitacao
  aprovar: boolean
}

export function SolicitacoesPendentes() {
  const [lista, setLista] = useState<Solicitacao[] | null>(null)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [decidindo, setDecidindo] = useState<Decisao | null>(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let ativa = true

    requisitar<Solicitacao[]>('/solicitacoes/pendentes')
      .then((dados) => {
        if (ativa) setLista(dados)
      })
      .catch((e: Error) => {
        if (ativa) setErro(e.message)
      })

    return () => {
      ativa = false
    }
  }, [tentativa])

  function recarregar() {
    setLista(null)
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  // Decidida, a solicitação deixa de ser pendente e sai da lista, sem nova consulta.
  function aoDecidir(decidida: Solicitacao) {
    setLista((atual) => atual && atual.filter((solicitacao) => solicitacao.id !== decidida.id))
    setDecidindo(null)
    if (decidida.status === 'APROVADA' && decidida.equipamento) {
      const { marca, modelo } = decidida.equipamento
      setAviso(`Solicitação #${decidida.id} aprovada. ${marca} ${modelo} emprestado para ${decidida.solicitante.nome}.`)
    } else {
      setAviso(`Solicitação #${decidida.id} recusada.`)
    }
  }

  function aoFechar(precisaRecarregar: boolean) {
    setDecidindo(null)
    if (precisaRecarregar) recarregar()
  }

  return (
    <>
      <CabecalhoPagina secao="Solicitações" titulo="Solicitações pendentes" subtitulo="Pedidos aguardando decisão. A justificativa é obrigatória na recusa." />

      {aviso && (
        <div className="mb-4">
          <Alerta tipo="ok">{aviso}</Alerta>
        </div>
      )}

      {erro && <ErroCarga mensagem={erro} aoTentarDeNovo={recarregar} />}

      {!erro && !lista && <Carregando texto="Carregando solicitações pendentes…" />}

      {!erro && lista && lista.length === 0 && (
        <Vazio titulo="Nenhuma solicitação pendente." texto="Quando um solicitante fizer um pedido, ele aparece aqui." />
      )}

      {!erro && lista && lista.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {lista.map((solicitacao) => (
            <CartaoSolicitacao key={solicitacao.id} solicitacao={solicitacao} mostrarSolicitante>
              <button type="button" onClick={() => setDecidindo({ solicitacao, aprovar: true })} className={CLASSE_BOTAO}>
                Aprovar
              </button>
              <button type="button" onClick={() => setDecidindo({ solicitacao, aprovar: false })} className={CLASSE_BOTAO_SECUNDARIO}>
                Recusar
              </button>
            </CartaoSolicitacao>
          ))}
        </div>
      )}

      {decidindo && (
        <DialogoDecisao
          solicitacao={decidindo.solicitacao}
          aprovar={decidindo.aprovar}
          aoDecidir={aoDecidir}
          aoFechar={aoFechar}
        />
      )}
    </>
  )
}
