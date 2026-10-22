import { useEffect, useState, type ReactNode } from 'react'
import { requisitar } from '../lib/api'
import { capitalizar, formatarData } from '../lib/formatos'
import type { DetalheEquipamento, StatusEquipamento } from '../tipos'
import { Carregando } from './Carregando'
import { ErroCarga } from './ErroCarga'
import { Etiqueta } from './Etiqueta'

type Props = {
  id: number
  aoFechar: () => void
}

const CLASSE_ROTULO = 'text-[11.5px] font-extrabold uppercase tracking-wide text-suave'

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <>
      <dt className={`${CLASSE_ROTULO} pt-0.5`}>{rotulo}</dt>
      <dd>{children}</dd>
    </>
  )
}

function semEmprestimo(status: StatusEquipamento) {
  if (status === 'DISPONIVEL') return 'Não está emprestado. Pode ser escolhido numa solicitação.'
  // Cadastrado já como emprestado: não há solicitação ligada.
  if (status === 'EMPRESTADO') return 'Cadastrado como emprestado, sem solicitação ligada.'
  return 'Não está emprestado.'
}

// Painel lateral com os dados de GET /api/equipamento/:id.
export function GavetaEquipamento({ id, aoFechar }: Props) {
  const [detalhe, setDetalhe] = useState<DetalheEquipamento | null>(null)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativa = true

    requisitar<DetalheEquipamento>(`/equipamento/${id}`)
      .then((dados) => {
        if (ativa) setDetalhe(dados)
      })
      .catch((e: Error) => {
        if (ativa) setErro(e.message)
      })

    return () => {
      ativa = false
    }
  }, [id, tentativa])

  // A tecla Esc fecha o painel.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') aoFechar()
    }

    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  function tentarDeNovo() {
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-texto/45" onClick={aoFechar} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-labelledby="gaveta-titulo" className="fixed inset-y-0 right-0 z-50 flex w-full max-w-120 flex-col bg-superficie shadow-2xl">
        <div className="flex items-start gap-3 border-b-2 border-marca px-5 py-4.5">
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-marca-texto">Equipamento #{id}</p>
            <h2 id="gaveta-titulo" className="text-lg font-bold">
              {detalhe ? `${detalhe.marca} ${detalhe.modelo}` : 'Detalhes'}
            </h2>
          </div>
          <button
            type="button"
            autoFocus
            onClick={aoFechar}
            aria-label="Fechar"
            className="ml-auto grid size-8 flex-none place-items-center rounded-lg border border-linha bg-superficie-2 text-lg text-suave hover:border-erro-texto hover:text-erro-texto"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4.5 overflow-y-auto px-5 pb-7 pt-4.5">
          {erro && <ErroCarga mensagem={erro} aoTentarDeNovo={tentarDeNovo} />}
          {!erro && !detalhe && <Carregando texto="Carregando o equipamento…" />}

          {detalhe && (
            <>
              <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3.5 gap-y-2.5 text-[13.5px]">
                <Linha rotulo="Status">
                  <Etiqueta status={detalhe.status} />
                </Linha>
                <Linha rotulo="Marca">{detalhe.marca}</Linha>
                <Linha rotulo="Modelo">{detalhe.modelo}</Linha>
                <Linha rotulo="Tipo">{capitalizar(detalhe.tipo)}</Linha>
                <Linha rotulo="Cadastrado em">{formatarData(detalhe.dtCadastro)}</Linha>
                <Linha rotulo="Cadastrado por">{detalhe.criadoPor.nome}</Linha>
              </dl>

              <div>
                <p className={`${CLASSE_ROTULO} mb-2`}>Empréstimo atual</p>
                {detalhe.emprestimoAtual ? (
                  <dl className="grid grid-cols-2 gap-x-4.5 gap-y-3.5 rounded-lg border border-linha bg-superficie-2 px-4 py-3.5 text-[14px]">
                    <div className="col-span-2">
                      <dt className={CLASSE_ROTULO}>Emprestado para</dt>
                      <dd className="font-semibold">{detalhe.emprestimoAtual.solicitante.nome}</dd>
                    </div>
                    <div>
                      <dt className={CLASSE_ROTULO}>Desde</dt>
                      <dd className="font-semibold">{formatarData(detalhe.emprestimoAtual.dtDecisao)}</dd>
                    </div>
                    <div>
                      <dt className={CLASSE_ROTULO}>Solicitação</dt>
                      <dd className="font-semibold">#{detalhe.emprestimoAtual.solicitacaoId}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="rounded-lg border border-linha bg-superficie-2 px-3.5 py-3 text-[13.5px]">{semEmprestimo(detalhe.status)}</p>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
