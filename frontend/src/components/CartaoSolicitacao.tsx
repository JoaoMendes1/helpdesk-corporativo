import type { ReactNode } from 'react'
import { formatarData, ROTULO_STATUS_SOLICITACAO, tituloSolicitacao } from '../lib/formatos'
import type { Solicitacao } from '../tipos'
import { Etiqueta } from './Etiqueta'
import { Icone } from './Icone'

type Props = {
  solicitacao: Solicitacao
  mostrarSolicitante?: boolean
  destacada?: boolean
  children?: ReactNode
}

type Dado = {
  rotulo: string
  valor: string
  detalhe?: string
  fraco?: boolean
}

function Info({ rotulo, valor, detalhe, fraco }: Dado) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[11px] font-extrabold uppercase tracking-wide text-suave">{rotulo}</dt>
      <dd className={`text-[14px] ${fraco ? 'text-texto-2' : 'font-semibold'}`}>{valor}</dd>
      {detalhe && <dd className="text-[12.5px] text-suave">{detalhe}</dd>}
    </div>
  )
}

function equipamento(solicitacao: Solicitacao): Dado {
  const { equipamento, status } = solicitacao
  if (equipamento) return { rotulo: 'Equipamento emprestado', valor: `${equipamento.marca} ${equipamento.modelo}` }
  return { rotulo: 'Equipamento', valor: status === 'PENDENTE' ? 'Definido na aprovação' : 'Nenhum', fraco: true }
}

function decisao(solicitacao: Solicitacao): Dado {
  const { status, aprovador, dtDecisao, historicos } = solicitacao
  if (status === 'PENDENTE') return { rotulo: 'Decisão', valor: 'Aguardando o aprovador', fraco: true }
  // O cancelamento não preenche o aprovador: quem cancelou está na última linha do histórico.
  if (status === 'CANCELADA') {
    const ultima = historicos[historicos.length - 1]
    return { rotulo: 'Decisão', valor: `Cancelada por ${ultima.usuario.nome}`, detalhe: `Em ${formatarData(ultima.dtRegistro)}` }
  }
  return {
    rotulo: 'Decisão',
    valor: `${ROTULO_STATUS_SOLICITACAO[status]} por ${aprovador?.nome}`,
    detalhe: dtDecisao ? `Em ${formatarData(dtDecisao)}` : undefined,
  }
}

// Uma solicitação, com o status, a decisão, a observação do aprovador e o histórico.
export function CartaoSolicitacao({ solicitacao, mostrarSolicitante, destacada, children }: Props) {
  const { id, descricao, status, observacao, historicos } = solicitacao
  const temObservacao = Boolean(observacao) && status !== 'PENDENTE'

  return (
    <article className={`overflow-hidden rounded-xl border bg-superficie shadow-sm ${destacada ? 'border-marca ring-3 ring-marca-claro' : 'border-linha'}`}>
      <div className="flex items-start gap-4 px-4.5 py-3.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold">
            <span className="mr-1.5 font-semibold text-suave">#{id}</span>
            {tituloSolicitacao(solicitacao)}
          </h2>
          <p className="mt-1.5 text-[14px] text-texto-2">{descricao}</p>
        </div>
        <Etiqueta status={status} />
      </div>

      <dl className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-5 gap-y-3 border-t border-linha bg-superficie-2 px-4.5 py-3.5">
        {mostrarSolicitante && <Info rotulo="Solicitante" valor={solicitacao.solicitante.nome} />}
        <Info rotulo="Solicitada em" valor={formatarData(solicitacao.dtSolicitacao)} />
        <Info {...equipamento(solicitacao)} />
        <Info {...decisao(solicitacao)} />
      </dl>

      {(temObservacao || children) && (
        <div className="flex flex-col gap-3.5 px-4.5 py-3.5">
          {temObservacao && (
            <div className={`rounded-lg border-l-3 bg-superficie-2 px-3 py-2.5 text-[13px] ${status === 'RECUSADA' ? 'border-erro-texto' : 'border-ok-texto'}`}>
              <p className="mb-0.5 text-[11px] font-extrabold uppercase tracking-wide text-suave">
                {status === 'RECUSADA' ? 'Justificativa da recusa' : 'Observação do aprovador'}
              </p>
              <p>{observacao}</p>
            </div>
          )}
          {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
      )}

      <details className="group border-t border-linha">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4.5 py-2.5 text-[12.5px] font-bold text-texto-2 hover:bg-superficie-2 [&::-webkit-details-marker]:hidden">
          <span className="transition-transform group-open:rotate-90">
            <Icone nome="seta" tamanho={14} />
          </span>
          Histórico ({historicos.length})
        </summary>
        <ol className="mb-4 ml-7 mr-4.5 border-l-2 border-linha">
          {historicos.map((linha) => (
            <li key={linha.id} className="relative py-1.5 pl-4.5 text-[13px]">
              <span className="absolute -left-[7px] top-3 size-3 rounded-full border-2 border-marca bg-superficie" aria-hidden="true" />
              <b>
                {linha.statusAnterior
                  ? `${ROTULO_STATUS_SOLICITACAO[linha.statusAnterior]} → ${ROTULO_STATUS_SOLICITACAO[linha.statusNovo]}`
                  : 'Solicitação criada'}
              </b>
              <small className="block text-[12.5px] text-suave">
                {linha.usuario.nome} · {formatarData(linha.dtRegistro)}
              </small>
              {linha.observacao && <q className="mt-0.5 block text-texto-2">{linha.observacao}</q>}
            </li>
          ))}
        </ol>
      </details>
    </article>
  )
}
