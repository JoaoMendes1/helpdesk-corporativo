import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Alerta } from '../components/Alerta'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { Campo } from '../components/Campo'
import { ErroApi, requisitar } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_BOTAO_SECUNDARIO, CLASSE_ENTRADA } from '../lib/estilos'
import { capitalizar, ROTULO_STATUS_EQUIPAMENTO, STATUS_EQUIPAMENTO } from '../lib/formatos'
import type { Equipamento, StatusEquipamento } from '../tipos'

// Tamanho das colunas de texto no banco, o mesmo limite da API.
const MAX_TEXTO = 191

// Valor da opção "Outro tipo…". Os tipos gravados não começam com "_".
const OUTRO_TIPO = '__outro'

type Erros = {
  marca?: string
  modelo?: string
  tipo?: string
  status?: string
}

// As mesmas mensagens da API, para a tela e a API falarem igual.
function validar(marca: string, modelo: string, tipo: string) {
  const erros: Erros = {}
  if (!marca.trim()) erros.marca = 'Informe a marca.'
  else if (marca.trim().length > MAX_TEXTO) erros.marca = `A marca pode ter no máximo ${MAX_TEXTO} caracteres.`
  if (!modelo.trim()) erros.modelo = 'Informe o modelo.'
  else if (modelo.trim().length > MAX_TEXTO) erros.modelo = `O modelo pode ter no máximo ${MAX_TEXTO} caracteres.`
  if (!tipo.trim()) erros.tipo = 'Informe o tipo.'
  else if (tipo.trim().length > MAX_TEXTO) erros.tipo = `O tipo pode ter no máximo ${MAX_TEXTO} caracteres.`
  return erros
}

export function NovoEquipamento() {
  const navegar = useNavigate()
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [tipoEscolhido, setTipoEscolhido] = useState('')
  const [tipoNovo, setTipoNovo] = useState('')
  const [status, setStatus] = useState<StatusEquipamento>('DISPONIVEL')
  const [erros, setErros] = useState<Erros>({})
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [tipos, setTipos] = useState<string[] | null>(null)

  // Os tipos existentes viram a lista do campo Tipo. Sem eles, o campo vira texto livre.
  useEffect(() => {
    requisitar<Equipamento[]>('/equipamentos')
      .then((todos) => setTipos([...new Set(todos.map((e) => e.tipo))].sort((a, b) => a.localeCompare(b, 'pt-BR'))))
      .catch(() => setTipos([]))
  }, [])

  const temLista = tipos !== null && tipos.length > 0
  const digitaTipo = !temLista || tipoEscolhido === OUTRO_TIPO
  const tipo = digitaTipo ? tipoNovo : tipoEscolhido

  async function enviar(evento: FormEvent) {
    evento.preventDefault()

    const novos = validar(marca, modelo, tipo)
    setErros(novos)
    if (Object.keys(novos).length > 0) {
      setMensagem('Corrija os campos destacados.')
      return
    }

    setMensagem('')
    setEnviando(true)
    try {
      const criado = await requisitar<Equipamento>('/novo-equipamento', { metodo: 'POST', corpo: { marca, modelo, tipo, status } })
      navegar('/equipamentos', { state: { criado: criado.id } })
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setMensagem(erro.message)
        setErros({
          marca: erro.campos.marca?.[0],
          modelo: erro.campos.modelo?.[0],
          tipo: erro.campos.tipo?.[0],
          status: erro.campos.status?.[0],
        })
      } else {
        setMensagem('Erro inesperado. Tente novamente.')
      }
      setEnviando(false)
    }
  }

  return (
    <>
      <CabecalhoPagina secao="Inventário" titulo="Novo equipamento" subtitulo="A data de cadastro e o responsável são registrados automaticamente." />

      <form noValidate onSubmit={enviar} className="flex max-w-160 flex-col gap-4">
        {mensagem && (
          <Alerta tipo="erro" titulo="Não foi possível cadastrar.">
            {mensagem}
          </Alerta>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="marca" rotulo="Marca" erro={erros.marca} obrigatorio>
            <input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ex.: Dell" aria-required="true" aria-invalid={Boolean(erros.marca)} className={CLASSE_ENTRADA} />
          </Campo>
          <Campo id="modelo" rotulo="Modelo" erro={erros.modelo} obrigatorio>
            <input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex.: Latitude 5440" aria-required="true" aria-invalid={Boolean(erros.modelo)} className={CLASSE_ENTRADA} />
          </Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="tipo" rotulo="Tipo" erro={digitaTipo && temLista ? undefined : erros.tipo} obrigatorio dica="Escolha um tipo existente para os filtros agruparem certo.">
            {temLista ? (
              <select id="tipo" value={tipoEscolhido} onChange={(e) => setTipoEscolhido(e.target.value)} aria-required="true" aria-invalid={Boolean(erros.tipo) && !digitaTipo} className={CLASSE_ENTRADA}>
                <option value="">Selecione…</option>
                {tipos.map((valor) => (
                  <option key={valor} value={valor}>
                    {capitalizar(valor)}
                  </option>
                ))}
                <option value={OUTRO_TIPO}>Outro tipo…</option>
              </select>
            ) : (
              <input
                id="tipo"
                value={tipoNovo}
                onChange={(e) => setTipoNovo(e.target.value)}
                disabled={tipos === null}
                placeholder={tipos === null ? 'Carregando os tipos…' : 'Ex.: notebook'}
                aria-required="true"
                aria-invalid={Boolean(erros.tipo)}
                className={CLASSE_ENTRADA}
              />
            )}
          </Campo>
          <Campo id="status" rotulo="Status" erro={erros.status} dica="Padrão: Disponível.">
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as StatusEquipamento)} aria-invalid={Boolean(erros.status)} className={CLASSE_ENTRADA}>
              {STATUS_EQUIPAMENTO.map((valor) => (
                <option key={valor} value={valor}>
                  {ROTULO_STATUS_EQUIPAMENTO[valor]}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {temLista && tipoEscolhido === OUTRO_TIPO && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="tipo-novo" rotulo="Novo tipo" erro={erros.tipo} obrigatorio>
              <input id="tipo-novo" autoFocus value={tipoNovo} onChange={(e) => setTipoNovo(e.target.value)} placeholder="Ex.: projetor" aria-required="true" aria-invalid={Boolean(erros.tipo)} className={CLASSE_ENTRADA} />
            </Campo>
          </div>
        )}

        <p className="text-[12.5px] text-suave">
          <span className="text-erro-texto">*</span> Campos obrigatórios.
        </p>

        <div className="mt-1 flex justify-end gap-2.5 border-t border-linha pt-4">
          <Link to="/equipamentos" className={CLASSE_BOTAO_SECUNDARIO}>
            Cancelar
          </Link>
          <button type="submit" disabled={enviando} className={CLASSE_BOTAO}>
            {enviando ? 'Cadastrando…' : 'Cadastrar equipamento'}
          </button>
        </div>
      </form>
    </>
  )
}
