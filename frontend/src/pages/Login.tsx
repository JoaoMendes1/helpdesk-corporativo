import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Alerta } from '../components/Alerta'
import { Campo } from '../components/Campo'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { ErroApi } from '../lib/api'
import { CLASSE_BOTAO, CLASSE_ENTRADA } from '../lib/estilos'

// Os usuários do seed, para quem avalia o projeto.
const SENHA_TESTE = 'Senha@123'
const USUARIOS_TESTE = [
  { email: 'aprovador@example.com', rotulo: 'aprovador' },
  { email: 'solicitante@example.com', rotulo: 'solicitante' },
  { email: 'inativo@example.com', rotulo: 'inativo (recusado)' },
]

// Endereço público de demonstração, onde os dados são os mesmos para todos os visitantes.
const ENDERECO_PUBLICO = 'helpdesk.joaomendes.dev.br'

type Erros = {
  email?: string
  senha?: string
}

export function Login() {
  const { usuario, entrar } = useAutenticacao()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Logado, a rota inicial leva à tela do perfil.
  if (usuario) {
    return <Navigate to="/" replace />
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()

    // As mesmas regras da API, para não esperar a resposta no erro óbvio.
    const novos: Erros = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novos.email = 'Informe um e-mail válido.'
    }
    if (!senha) {
      novos.senha = 'Informe a senha.'
    }
    setErros(novos)
    setMensagem('')
    if (novos.email || novos.senha) {
      return
    }

    setEnviando(true)
    try {
      await entrar(email, senha)
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setMensagem(erro.message)
        setErros({ email: erro.campos.email?.[0], senha: erro.campos.senha?.[0] })
      } else {
        setMensagem('Erro inesperado. Tente novamente.')
      }
      setEnviando(false)
    }
  }

  function preencher(emailTeste: string) {
    setEmail(emailTeste)
    setSenha(SENHA_TESTE)
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-linear-160 from-azul to-[#12315f] p-12 text-white md:flex">
        <div>
          <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#a9e08f]">Solicitação e aprovação de equipamentos</p>
          <h2 className="text-4xl font-extrabold tracking-tight">HelpDesk Corporativo</h2>
          <p className="mt-3.5 max-w-md text-[15px] text-[#c9d6ee]">
            O solicitante descreve o equipamento de que precisa e acompanha cada pedido. O aprovador cuida do inventário e decide as solicitações, com justificativa.
          </p>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm text-[#e2e9f6]">
          <li>• Pedido com histórico de cada mudança</li>
          <li>• Decisão do aprovador com justificativa</li>
          <li>• Painel do inventário para o aprovador</li>
        </ul>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <form noValidate onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-4">
          {window.location.hostname === ENDERECO_PUBLICO && (
            <Alerta tipo="info" titulo="Ambiente de demonstração">
              O que for feito aqui fica registrado e aparece para todos que acessarem, até os dados serem zerados.
            </Alerta>
          )}

          <div>
            <h1 className="text-2xl font-bold">Entrar</h1>
            <p className="mt-1 text-[13px] text-suave">Use o seu e-mail e a sua senha.</p>
          </div>

          {mensagem && <Alerta tipo="erro">{mensagem}</Alerta>}

          <Campo id="email" rotulo="E-mail" erro={erros.email}>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="nome@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(erros.email)}
              className={CLASSE_ENTRADA}
            />
          </Campo>

          <Campo id="senha" rotulo="Senha" erro={erros.senha}>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={Boolean(erros.senha)}
              className={CLASSE_ENTRADA}
            />
          </Campo>

          <button type="submit" disabled={enviando} className={`${CLASSE_BOTAO} w-full py-3`}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="rounded-lg border border-dashed border-linha-forte px-3.5 py-3 text-[12.5px] text-suave">
            <b className="text-texto">Usuários de teste</b> · senha <b className="text-texto">{SENHA_TESTE}</b>
            <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1">
              {USUARIOS_TESTE.map((teste) => (
                <button key={teste.email} type="button" onClick={() => preencher(teste.email)} className="font-bold text-marca-texto underline underline-offset-2">
                  {teste.rotulo}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
