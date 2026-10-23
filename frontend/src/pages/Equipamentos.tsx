import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Alerta } from '../components/Alerta'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { Carregando } from '../components/Carregando'
import { ErroCarga } from '../components/ErroCarga'
import { Etiqueta } from '../components/Etiqueta'
import { GavetaEquipamento } from '../components/GavetaEquipamento'
import { Icone } from '../components/Icone'
import { Vazio } from '../components/Vazio'
import { requisitar } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_BOTAO_SECUNDARIO, CLASSE_ENTRADA } from '../lib/estilos'
import { capitalizar, formatarData, ROTULO_STATUS_EQUIPAMENTO, STATUS_EQUIPAMENTO } from '../lib/formatos'
import type { Equipamento } from '../tipos'

const CLASSE_ROTULO = 'text-[11.5px] font-bold uppercase tracking-wide text-texto-2'

export function Equipamentos() {
  const [busca, setBusca] = useSearchParams()
  const local = useLocation()
  const [lista, setLista] = useState<Equipamento[] | null>(null)
  const [tipos, setTipos] = useState<string[]>([])
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [aberto, setAberto] = useState<number | null>(null)

  // Os filtros ficam no endereço: o F5 e o link do painel os mantêm. Status desconhecido é ignorado.
  const status = STATUS_EQUIPAMENTO.find((valor) => valor === busca.get('status')) ?? ''
  const tipo = busca.get('tipo') ?? ''

  // Id do equipamento recém-cadastrado, enviado pela tela de cadastro.
  const criado = (local.state as { criado?: number } | null)?.criado

  // As opções do filtro de tipo vêm da lista completa, uma vez ao abrir a tela.
  useEffect(() => {
    requisitar<Equipamento[]>('/equipamentos')
      .then((todos) => setTipos([...new Set(todos.map((e) => e.tipo))].sort((a, b) => a.localeCompare(b, 'pt-BR'))))
      .catch(() => setTipos([]))
  }, [])

  useEffect(() => {
    let ativa = true
    const filtros = new URLSearchParams()
    if (status) filtros.set('status', status)
    if (tipo) filtros.set('tipo', tipo)
    const consulta = filtros.toString()

    requisitar<Equipamento[]>('/equipamentos' + (consulta ? '?' + consulta : ''))
      .then((dados) => {
        if (ativa) setLista(dados)
      })
      .catch((e: Error) => {
        if (ativa) setErro(e.message)
      })

    return () => {
      ativa = false
    }
  }, [status, tipo, tentativa])

  function filtrar(campo: 'status' | 'tipo', valor: string) {
    const novos = new URLSearchParams(busca)
    if (valor) {
      novos.set(campo, valor)
    } else {
      novos.delete(campo)
    }
    setLista(null)
    setErro('')
    setBusca(novos)
  }

  function limparFiltros() {
    setLista(null)
    setErro('')
    setBusca({})
  }

  function tentarDeNovo() {
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  // Um tipo do endereço que não está na lista ainda aparece como opção.
  const opcoesTipo = tipo && !tipos.includes(tipo) ? [...tipos, tipo] : tipos
  const temFiltro = Boolean(status || tipo)

  return (
    <>
      <CabecalhoPagina
        secao="Inventário"
        titulo="Equipamentos"
        subtitulo="Todos os equipamentos cadastrados, com filtros por status e tipo."
        acao={
          <Link to="/equipamentos/novo" className={CLASSE_BOTAO}>
            <Icone nome="mais" tamanho={16} />
            Novo equipamento
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-x-3.5 gap-y-3 rounded-lg border border-linha bg-superficie-2 px-4 py-3.5">
        <div className="flex w-full flex-col gap-1.5 sm:w-55">
          <label htmlFor="filtro-status" className={CLASSE_ROTULO}>
            Status
          </label>
          <select id="filtro-status" value={status} onChange={(e) => filtrar('status', e.target.value)} className={CLASSE_ENTRADA}>
            <option value="">Todos</option>
            {STATUS_EQUIPAMENTO.map((valor) => (
              <option key={valor} value={valor}>
                {ROTULO_STATUS_EQUIPAMENTO[valor]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-55">
          <label htmlFor="filtro-tipo" className={CLASSE_ROTULO}>
            Tipo
          </label>
          <select id="filtro-tipo" value={tipo} onChange={(e) => filtrar('tipo', e.target.value)} className={CLASSE_ENTRADA}>
            <option value="">Todos</option>
            {opcoesTipo.map((valor) => (
              <option key={valor} value={valor}>
                {capitalizar(valor)}
              </option>
            ))}
          </select>
        </div>
        {temFiltro && (
          <button type="button" onClick={limparFiltros} className={CLASSE_BOTAO_SECUNDARIO}>
            Limpar filtros
          </button>
        )}
        {lista && (
          <span className="pb-2 text-[13px] tabular-nums text-suave sm:ml-auto">
            {lista.length} {lista.length === 1 ? 'equipamento' : 'equipamentos'}
          </span>
        )}
      </div>

      {criado && (
        <div className="mb-4">
          <Alerta tipo="ok">Equipamento #{criado} cadastrado.</Alerta>
        </div>
      )}

      {erro && <ErroCarga mensagem={erro} aoTentarDeNovo={tentarDeNovo} />}

      {!erro && !lista && <Carregando texto="Carregando equipamentos…" />}

      {!erro && lista && lista.length === 0 && (
        <Vazio
          titulo={temFiltro ? 'Nenhum equipamento com esses filtros.' : 'Nenhum equipamento cadastrado.'}
          texto={temFiltro ? 'Mude ou limpe os filtros para ver mais resultados.' : 'Cadastre o primeiro equipamento do inventário.'}
        >
          {temFiltro ? (
            <button type="button" onClick={limparFiltros} className={CLASSE_BOTAO_SECUNDARIO}>
              Limpar filtros
            </button>
          ) : (
            <Link to="/equipamentos/novo" className={CLASSE_BOTAO}>
              Novo equipamento
            </Link>
          )}
        </Vazio>
      )}

      {!erro && lista && lista.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-linha bg-superficie shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-linha bg-superficie-2 text-[11.5px] font-extrabold uppercase tracking-wide text-texto-2">
                <th className="w-18 px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Equipamento</th>
                <th className="px-4 py-2.5">Tipo</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Cadastro</th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((equipamento) => (
                <tr
                  key={equipamento.id}
                  tabIndex={0}
                  onClick={() => setAberto(equipamento.id)}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Enter') {
                      // Sem isso, o mesmo Enter aciona o botão Fechar, que recebe o foco ao abrir.
                      evento.preventDefault()
                      setAberto(equipamento.id)
                    }
                  }}
                  className={`cursor-pointer border-b border-linha last:border-b-0 hover:bg-superficie-2 ${equipamento.id === criado ? 'bg-marca-claro' : ''}`}
                >
                  <td className="px-4 py-3 font-semibold tabular-nums text-suave">{equipamento.id}</td>
                  <td className="px-4 py-3 font-bold">
                    {equipamento.marca} {equipamento.modelo}
                  </td>
                  <td className="px-4 py-3">{capitalizar(equipamento.tipo)}</td>
                  <td className="px-4 py-3">
                    <Etiqueta status={equipamento.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatarData(equipamento.dtCadastro)}</td>
                  <td className="px-4 py-3 text-suave">
                    <Icone nome="seta" tamanho={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aberto !== null && <GavetaEquipamento key={aberto} id={aberto} aoFechar={() => setAberto(null)} />}
    </>
  )
}
