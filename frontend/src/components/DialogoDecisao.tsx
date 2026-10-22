import { useEffect, useState } from 'react'
import { ErroApi, requisitar } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_BOTAO_PERIGO, CLASSE_BOTAO_SECUNDARIO, CLASSE_ENTRADA } from '../lib/estilos'
import { capitalizar, formatarData, tituloSolicitacao } from '../lib/formatos'
import { MAX_OBSERVACAO } from '../lib/limites'
import type { Equipamento, Solicitacao } from '../tipos'
import { Alerta } from './Alerta'
import { Campo } from './Campo'
import { Carregando } from './Carregando'
import { Dialogo } from './Dialogo'
import { ErroCarga } from './ErroCarga'

type Props = {
  solicitacao: Solicitacao
  aprovar: boolean
  aoDecidir: (decidida: Solicitacao) => void
  aoFechar: (recarregar: boolean) => void
}

type Erros = {
  equipamento?: string
  observacao?: string
}

const CLASSE_ROTULO = 'text-[11px] font-extrabold uppercase tracking-wide text-suave'

function opcao(equipamento: Equipamento) {
  return (
    <option key={equipamento.id} value={equipamento.id}>
      {equipamento.marca} {equipamento.modelo} · {capitalizar(equipamento.tipo)}
    </option>
  )
}

// Aprovar ou recusar uma solicitação pendente. Na aprovação, o aprovador escolhe o equipamento.
export function DialogoDecisao({ solicitacao, aprovar, aoDecidir, aoFechar }: Props) {
  const [disponiveis, setDisponiveis] = useState<Equipamento[] | null>(null)
  const [erroCarga, setErroCarga] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [equipamentoId, setEquipamentoId] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  // Com 404, 409 ou 422, a solicitação ou o equipamento mudou fora desta tela: a lista é recarregada.
  const [estadoMudou, setEstadoMudou] = useState(false)

  // Buscados ao abrir: a lista muda a cada aprovação, e dados velhos levariam ao 409.
  useEffect(() => {
    if (!aprovar) return
    let ativa = true

    requisitar<Equipamento[]>('/equipamentos?status=DISPONIVEL')
      .then((dados) => {
        if (ativa) setDisponiveis(dados)
      })
      .catch((e: Error) => {
        if (ativa) setErroCarga(e.message)
      })

    return () => {
      ativa = false
    }
  }, [aprovar, tentativa])

  function tentarDeNovo() {
    setErroCarga('')
    setTentativa((valor) => valor + 1)
  }

  // O tipo é texto livre e pode não coincidir: todos os disponíveis aparecem, os do tipo pedido primeiro.
  const doTipo = disponiveis?.filter((e) => e.tipo === solicitacao.tipoSolicitado) ?? []
  const outros = disponiveis?.filter((e) => e.tipo !== solicitacao.tipoSolicitado) ?? []
  const semEquipamento = aprovar && disponiveis !== null && disponiveis.length === 0

  async function confirmar() {
    // As mesmas mensagens da API.
    const novos: Erros = {}
    if (aprovar && !equipamentoId) novos.equipamento = 'Escolha o equipamento para aprovar.'
    if (!aprovar && !observacao.trim()) novos.observacao = 'Informe a justificativa da recusa.'
    else if (observacao.trim().length > MAX_OBSERVACAO) {
      novos.observacao = `A ${aprovar ? 'observação' : 'justificativa'} pode ter no máximo ${MAX_OBSERVACAO} caracteres.`
    }
    setErros(novos)
    if (novos.equipamento || novos.observacao) return

    setEnviando(true)
    setErro('')
    try {
      const caminho = `/solicitacoes/${solicitacao.id}/${aprovar ? 'aprovacao' : 'recusa'}`
      const corpo = aprovar ? { equipamentoId: Number(equipamentoId), observacao } : { observacao }
      aoDecidir(await requisitar<Solicitacao>(caminho, { metodo: 'POST', corpo }))
    } catch (e) {
      // O 409 tem duas causas, e só a API sabe qual: a tela mostra a mensagem dela.
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
      if (e instanceof ErroApi) {
        setErros({ equipamento: e.campos.equipamentoId?.[0], observacao: e.campos.observacao?.[0] })
        if (e.status === 404 || e.status === 409 || e.status === 422) setEstadoMudou(true)
      }
      setEnviando(false)
    }
  }

  const acao = aprovar ? 'Aprovar' : 'Recusar'

  return (
    <Dialogo
      titulo={`${acao} a solicitação #${solicitacao.id}`}
      aoFechar={() => aoFechar(estadoMudou)}
      bloqueado={enviando}
      rodape={
        <>
          <button type="button" onClick={() => aoFechar(estadoMudou)} disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>
            Voltar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={enviando || estadoMudou || (aprovar && !disponiveis?.length)}
            className={aprovar ? CLASSE_BOTAO : CLASSE_BOTAO_PERIGO}
          >
            {enviando ? `${aprovar ? 'Aprovando' : 'Recusando'}…` : acao}
          </button>
        </>
      }
    >
      {erro && (
        <Alerta tipo="erro" titulo="Não foi possível concluir.">
          {erro}
        </Alerta>
      )}

      <dl className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 rounded-lg border border-linha bg-superficie-2 px-4 py-3.5 text-[14px]">
        <div className="col-span-2">
          <dt className={CLASSE_ROTULO}>Pedido</dt>
          <dd className="font-semibold">{tituloSolicitacao(solicitacao)}</dd>
          <dd className="text-[13px] text-texto-2">{solicitacao.descricao}</dd>
        </div>
        <div>
          <dt className={CLASSE_ROTULO}>Solicitante</dt>
          <dd className="font-semibold">{solicitacao.solicitante.nome}</dd>
        </div>
        <div>
          <dt className={CLASSE_ROTULO}>Solicitada em</dt>
          <dd className="font-semibold">{formatarData(solicitacao.dtSolicitacao)}</dd>
        </div>
      </dl>

      {aprovar && erroCarga && <ErroCarga mensagem={erroCarga} aoTentarDeNovo={tentarDeNovo} />}
      {aprovar && !erroCarga && !disponiveis && <Carregando texto="Carregando os equipamentos disponíveis…" />}

      {semEquipamento && (
        <Alerta tipo="info" titulo="Nenhum equipamento disponível.">
          Não há como aprovar agora. Recuse com uma justificativa ou cadastre um equipamento.
        </Alerta>
      )}

      {/* Na aprovação, os campos só aparecem com a lista carregada: o foco não pula enquanto se digita. */}
      {aprovar && disponiveis && disponiveis.length > 0 && (
        <Campo
          id="decisao-equipamento"
          rotulo="Equipamento a emprestar"
          erro={erros.equipamento}
          obrigatorio
          dica={`${doTipo.length} do tipo ${capitalizar(solicitacao.tipoSolicitado)} entre os ${disponiveis.length} disponíveis.`}
        >
          <select
            id="decisao-equipamento"
            autoFocus
            value={equipamentoId}
            onChange={(e) => setEquipamentoId(e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(erros.equipamento)}
            className={CLASSE_ENTRADA}
          >
            <option value="">Selecione…</option>
            {doTipo.length > 0 && <optgroup label={`Do tipo pedido (${capitalizar(solicitacao.tipoSolicitado)})`}>{doTipo.map(opcao)}</optgroup>}
            {outros.length > 0 && <optgroup label="Outros tipos">{outros.map(opcao)}</optgroup>}
          </select>
        </Campo>
      )}

      {(!aprovar || (disponiveis && disponiveis.length > 0)) && (
        <Campo
          id="decisao-observacao"
          rotulo={aprovar ? 'Observação' : 'Justificativa'}
          erro={erros.observacao}
          obrigatorio={!aprovar}
          dica={aprovar ? 'Opcional. O solicitante vê no histórico.' : 'O solicitante vê no histórico.'}
        >
          <textarea
            id="decisao-observacao"
            autoFocus={!aprovar}
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder={aprovar ? 'Ex.: Retirar com a equipe de suporte.' : 'Ex.: Não há equipamento compatível no estoque.'}
            aria-required={!aprovar}
            aria-invalid={Boolean(erros.observacao)}
            className={`${CLASSE_ENTRADA} resize-y`}
          />
        </Campo>
      )}
    </Dialogo>
  )
}
