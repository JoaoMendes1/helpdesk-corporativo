import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Alerta } from '../components/Alerta'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { CartaoSolicitacao } from '../components/CartaoSolicitacao'
import { Carregando } from '../components/Carregando'
import { Dialogo } from '../components/Dialogo'
import { ErroCarga } from '../components/ErroCarga'
import { Icone } from '../components/Icone'
import { Vazio } from '../components/Vazio'
import { ErroApi, requisitar } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_BOTAO_PERIGO, CLASSE_BOTAO_SECUNDARIO } from '../lib/estilos'
import { tituloSolicitacao } from '../lib/formatos'
import type { Solicitacao } from '../tipos'

type PropsCancelamento = {
  solicitacao: Solicitacao
  aoCancelar: (cancelada: Solicitacao) => void
  aoFechar: (recarregar: boolean) => void
}

function DialogoCancelamento({ solicitacao, aoCancelar, aoFechar }: PropsCancelamento) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  // Com 404 ou 409, a solicitação mudou fora desta tela: repetir não adianta, e a lista é recarregada.
  const [estadoMudou, setEstadoMudou] = useState(false)

  async function confirmar() {
    setEnviando(true)
    setErro('')
    try {
      const cancelada = await requisitar<Solicitacao>(`/solicitacoes/${solicitacao.id}/cancelamento`, { metodo: 'POST' })
      aoCancelar(cancelada)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
      if (e instanceof ErroApi && (e.status === 404 || e.status === 409)) setEstadoMudou(true)
      setEnviando(false)
    }
  }

  return (
    <Dialogo
      titulo={`Cancelar a solicitação #${solicitacao.id}?`}
      aoFechar={() => aoFechar(estadoMudou)}
      bloqueado={enviando}
      rodape={
        <>
          {/* O foco começa no Voltar: um Enter distraído não cancela o pedido. */}
          <button type="button" autoFocus onClick={() => aoFechar(estadoMudou)} disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>
            Voltar
          </button>
          <button type="button" onClick={confirmar} disabled={enviando || estadoMudou} className={CLASSE_BOTAO_PERIGO}>
            {enviando ? 'Cancelando…' : 'Cancelar solicitação'}
          </button>
        </>
      }
    >
      {erro && (
        <Alerta tipo="erro" titulo="Não foi possível cancelar.">
          {erro}
        </Alerta>
      )}
      <p>
        O pedido de <b>{tituloSolicitacao(solicitacao)}</b> sai da fila do aprovador. Só é possível cancelar enquanto está pendente.
      </p>
    </Dialogo>
  )
}

export function MinhasSolicitacoes() {
  const local = useLocation()
  // Id da solicitação recém-criada, enviado pela tela de nova solicitação.
  const criada = (local.state as { criada?: number } | null)?.criada
  const [lista, setLista] = useState<Solicitacao[] | null>(null)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [cancelando, setCancelando] = useState<Solicitacao | null>(null)
  const [aviso, setAviso] = useState(criada ? `Solicitação #${criada} enviada ao aprovador.` : '')

  useEffect(() => {
    let ativa = true

    requisitar<Solicitacao[]>('/solicitacoes/minhas')
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

  // A API devolve a solicitação já cancelada: ela substitui a da lista, sem nova consulta.
  function aoCancelar(cancelada: Solicitacao) {
    setLista((atual) => atual && atual.map((solicitacao) => (solicitacao.id === cancelada.id ? cancelada : solicitacao)))
    setCancelando(null)
    setAviso(`Solicitação #${cancelada.id} cancelada.`)
  }

  function aoFechar(precisaRecarregar: boolean) {
    setCancelando(null)
    if (precisaRecarregar) recarregar()
  }

  const novaSolicitacao = (
    <Link to="/solicitacoes/nova" className={CLASSE_BOTAO}>
      <Icone nome="mais" tamanho={16} />
      Nova solicitação
    </Link>
  )

  return (
    <>
      <CabecalhoPagina secao="Solicitações" titulo="Minhas solicitações" subtitulo="Acompanhe o status e o histórico de cada pedido seu." acao={novaSolicitacao} />

      {aviso && (
        <div className="mb-4">
          <Alerta tipo="ok">{aviso}</Alerta>
        </div>
      )}

      {erro && <ErroCarga mensagem={erro} aoTentarDeNovo={recarregar} />}

      {!erro && !lista && <Carregando texto="Carregando suas solicitações…" />}

      {!erro && lista && lista.length === 0 && (
        <Vazio titulo="Você ainda não fez nenhuma solicitação." texto="Descreva o equipamento de que você precisa, e o aprovador responde por aqui.">
          <Link to="/solicitacoes/nova" className={CLASSE_BOTAO}>
            Nova solicitação
          </Link>
        </Vazio>
      )}

      {!erro && lista && lista.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {lista.map((solicitacao) => (
            <CartaoSolicitacao key={solicitacao.id} solicitacao={solicitacao} destacada={solicitacao.id === criada}>
              {solicitacao.status === 'PENDENTE' && (
                <button type="button" onClick={() => setCancelando(solicitacao)} className={CLASSE_BOTAO_SECUNDARIO}>
                  Cancelar solicitação
                </button>
              )}
            </CartaoSolicitacao>
          ))}
        </div>
      )}

      {cancelando && <DialogoCancelamento solicitacao={cancelando} aoCancelar={aoCancelar} aoFechar={aoFechar} />}
    </>
  )
}
