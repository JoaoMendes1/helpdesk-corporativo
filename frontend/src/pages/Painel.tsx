import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { Carregando } from '../components/Carregando'
import { ErroCarga } from '../components/ErroCarga'
import { Etiqueta } from '../components/Etiqueta'
import { Vazio } from '../components/Vazio'
import { requisitar } from '../lib/api'
import { CLASSE_BOTAO } from '../lib/estilos'
import { formatarData, ROTULO_STATUS_EQUIPAMENTO, STATUS_EQUIPAMENTO, tituloSolicitacao } from '../lib/formatos'
import type { Solicitacao, StatusEquipamento, Totais } from '../tipos'

const COR: Record<StatusEquipamento, string> = {
  DISPONIVEL: 'bg-destaque',
  EMPRESTADO: 'bg-info-texto',
  MANUTENCAO: 'bg-[#d39b2a]',
  INATIVO: 'bg-[#a3abb8]',
}

const DESCRICAO: Record<StatusEquipamento, string> = {
  DISPONIVEL: 'Prontos para empréstimo',
  EMPRESTADO: 'Com algum colaborador',
  MANUTENCAO: 'Fora de uso temporariamente',
  INATIVO: 'Baixados do inventário',
}

type Dados = {
  totais: Totais
  pendentes: Solicitacao[]
}

export function Painel() {
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativa = true

    // As duas consultas saem juntas; a tela espera as duas.
    Promise.all([requisitar<Totais>('/equipamentos/totais'), requisitar<Solicitacao[]>('/solicitacoes/pendentes')])
      .then(([totais, pendentes]) => {
        if (ativa) setDados({ totais, pendentes })
      })
      .catch((e: Error) => {
        if (ativa) setErro(e.message)
      })

    // Descarta a resposta se a tela foi fechada antes de ela chegar.
    return () => {
      ativa = false
    }
  }, [tentativa])

  function tentarDeNovo() {
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  const cabecalho = (
    <CabecalhoPagina secao="Visão geral" titulo="Painel" subtitulo="Totais de equipamentos por status e o que precisa da sua atenção." />
  )

  if (erro) {
    return (
      <>
        {cabecalho}
        <ErroCarga mensagem={erro} aoTentarDeNovo={tentarDeNovo} />
      </>
    )
  }

  if (!dados) {
    return (
      <>
        {cabecalho}
        <Carregando texto="Carregando o painel…" />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4" aria-hidden="true">
          {STATUS_EQUIPAMENTO.map((status) => (
            <div key={status} className="h-27 animate-pulse rounded-xl bg-superficie-2" />
          ))}
        </div>
      </>
    )
  }

  const { totais, pendentes } = dados

  if (totais.total === 0) {
    return (
      <>
        {cabecalho}
        <Vazio titulo="Nenhum equipamento cadastrado ainda." texto="Cadastre o primeiro equipamento para ver os totais por status aqui.">
          <Link to="/equipamentos/novo" className={CLASSE_BOTAO}>
            Novo equipamento
          </Link>
        </Vazio>
      </>
    )
  }

  const porcentagem = (status: StatusEquipamento) => Math.round((totais.porStatus[status] / totais.total) * 100)

  return (
    <>
      {cabecalho}

      <div className="mb-4.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {STATUS_EQUIPAMENTO.map((status) => (
          <Link
            key={status}
            to={`/equipamentos?status=${status}`}
            className="relative flex flex-col gap-1 overflow-hidden rounded-xl border border-linha bg-superficie py-4 pl-5 pr-4.5 shadow-sm hover:border-linha-forte"
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${COR[status]}`} aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wide text-suave">{ROTULO_STATUS_EQUIPAMENTO[status]}</span>
            <span className="text-[32px] font-bold leading-tight tabular-nums">{totais.porStatus[status]}</span>
            <span className="text-[12.5px] text-suave">{DESCRICAO[status]}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-linha bg-superficie px-5 py-4.5 shadow-sm">
          <h2 className="text-[15px] font-bold">Distribuição do inventário</h2>
          <p className="mb-3.5 text-[13px] text-suave">{totais.total} equipamentos cadastrados</p>
          <div
            role="img"
            aria-label={STATUS_EQUIPAMENTO.map((status) => `${ROTULO_STATUS_EQUIPAMENTO[status]} ${totais.porStatus[status]}`).join(', ')}
            className="mb-3.5 flex h-3.5 overflow-hidden rounded-full bg-superficie-2"
          >
            {STATUS_EQUIPAMENTO.map((status) => (
              <span key={status} className={COR[status]} style={{ width: `${porcentagem(status)}%` }} />
            ))}
          </div>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {STATUS_EQUIPAMENTO.map((status) => (
              <div key={status} className="flex items-center gap-2 text-[13px]">
                <span className={`size-2.5 flex-none rounded-[3px] ${COR[status]}`} aria-hidden="true" />
                {ROTULO_STATUS_EQUIPAMENTO[status]}
                <b className="ml-auto tabular-nums">{porcentagem(status)}%</b>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-linha bg-superficie px-5 py-4.5 shadow-sm">
          <h2 className="text-[15px] font-bold">Aguardando a sua decisão</h2>
          <p className="mb-3.5 text-[13px] text-suave">
            {pendentes.length} {pendentes.length === 1 ? 'solicitação pendente' : 'solicitações pendentes'}
          </p>
          {pendentes.length === 0 ? (
            <p className="text-[12.5px] text-suave">Nenhuma solicitação pendente.</p>
          ) : (
            <ul>
              {pendentes.map((solicitacao) => (
                <li key={solicitacao.id} className="flex items-center gap-2.5 border-t border-linha py-2.5 text-[13px] first:border-t-0">
                  <div className="min-w-0 flex-1">
                    <b>
                      #{solicitacao.id} · {tituloSolicitacao(solicitacao)}
                    </b>
                    <small className="block text-suave">
                      {solicitacao.solicitante.nome} · {formatarData(solicitacao.dtSolicitacao)}
                    </small>
                  </div>
                  <Etiqueta status={solicitacao.status} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/solicitacoes/pendentes" className="mt-3 inline-block font-bold text-marca-texto underline underline-offset-2">
            Ver pendentes
          </Link>
        </section>
      </div>
    </>
  )
}