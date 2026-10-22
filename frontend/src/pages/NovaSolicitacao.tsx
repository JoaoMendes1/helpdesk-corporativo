import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Alerta } from '../components/Alerta'
import { CabecalhoPagina } from '../components/CabecalhoPagina'
import { Campo } from '../components/Campo'
import { ErroApi, requisitar } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_BOTAO_SECUNDARIO, CLASSE_ENTRADA } from '../lib/estilos'
import { MAX_TEXTO } from '../lib/limites'
import type { Solicitacao } from '../tipos'

type Erros = {
  tipo?: string
  marca?: string
  modelo?: string
  descricao?: string
}

// As mesmas mensagens da API, para a tela e a API falarem igual.
function validar(tipo: string, marca: string, modelo: string, descricao: string) {
  const erros: Erros = {}
  if (!tipo.trim()) erros.tipo = 'Informe o tipo do equipamento.'
  else if (tipo.trim().length > MAX_TEXTO) erros.tipo = `O tipo pode ter no máximo ${MAX_TEXTO} caracteres.`
  if (marca.trim().length > MAX_TEXTO) erros.marca = `A marca pode ter no máximo ${MAX_TEXTO} caracteres.`
  if (modelo.trim().length > MAX_TEXTO) erros.modelo = `O modelo pode ter no máximo ${MAX_TEXTO} caracteres.`
  if (!descricao.trim()) erros.descricao = 'Descreva o motivo do pedido.'
  else if (descricao.trim().length > MAX_TEXTO) erros.descricao = `A descrição pode ter no máximo ${MAX_TEXTO} caracteres.`
  return erros
}

export function NovaSolicitacao() {
  const navegar = useNavigate()
  const [tipo, setTipo] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()

    const novos = validar(tipo, marca, modelo, descricao)
    setErros(novos)
    if (Object.keys(novos).length > 0) {
      setMensagem('Corrija os campos destacados.')
      return
    }

    setMensagem('')
    setEnviando(true)
    try {
      // A API remove os espaços das pontas e grava marca e modelo vazios como nulos.
      const corpo = { tipoSolicitado: tipo, descricao, marcaSolicitada: marca, modeloSolicitado: modelo }
      const criada = await requisitar<Solicitacao>('/solicitacoes', { metodo: 'POST', corpo })
      navegar('/solicitacoes', { state: { criada: criada.id } })
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setMensagem(erro.message)
        setErros({
          tipo: erro.campos.tipoSolicitado?.[0],
          marca: erro.campos.marcaSolicitada?.[0],
          modelo: erro.campos.modeloSolicitado?.[0],
          descricao: erro.campos.descricao?.[0],
        })
      } else {
        setMensagem('Erro inesperado. Tente novamente.')
      }
      setEnviando(false)
    }
  }

  return (
    <>
      <CabecalhoPagina secao="Solicitações" titulo="Nova solicitação" subtitulo="Descreva o equipamento de que você precisa. O aprovador escolhe qual entregar." />

      <form noValidate onSubmit={enviar} className="flex max-w-160 flex-col gap-4">
        {mensagem && (
          <Alerta tipo="erro" titulo="Não foi possível enviar.">
            {mensagem}
          </Alerta>
        )}

        <Campo id="tipo" rotulo="Tipo" erro={erros.tipo} obrigatorio dica="O tipo de equipamento: notebook, monitor, celular…">
          <input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex.: notebook" aria-required="true" aria-invalid={Boolean(erros.tipo)} className={CLASSE_ENTRADA} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="marca" rotulo="Marca" erro={erros.marca} dica="Opcional.">
            <input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ex.: Dell" aria-invalid={Boolean(erros.marca)} className={CLASSE_ENTRADA} />
          </Campo>
          <Campo id="modelo" rotulo="Modelo" erro={erros.modelo} dica="Opcional.">
            <input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex.: Latitude 5440" aria-invalid={Boolean(erros.modelo)} className={CLASSE_ENTRADA} />
          </Campo>
        </div>

        <Campo id="descricao" rotulo="Para que você precisa?" erro={erros.descricao} obrigatorio dica={`Até ${MAX_TEXTO} caracteres.`}>
          <textarea
            id="descricao"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Notebook para um treinamento externo de 3 dias."
            aria-required="true"
            aria-invalid={Boolean(erros.descricao)}
            className={`${CLASSE_ENTRADA} resize-y`}
          />
        </Campo>

        <p className="text-[12.5px] text-suave">
          O aprovador escolhe qual equipamento entregar, conforme o estoque. Se não houver, ele recusa com uma justificativa.
          <br />
          <span className="text-erro-texto">*</span> Campos obrigatórios.
        </p>

        <div className="mt-1 flex justify-end gap-2.5 border-t border-linha pt-4">
          <Link to="/solicitacoes" className={CLASSE_BOTAO_SECUNDARIO}>
            Cancelar
          </Link>
          <button type="submit" disabled={enviando} className={CLASSE_BOTAO}>
            {enviando ? 'Enviando…' : 'Enviar solicitação'}
          </button>
        </div>
      </form>
    </>
  )
}
