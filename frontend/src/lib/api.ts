const MENSAGEM_INDISPONIVEL = 'Serviço temporariamente indisponível. Tente novamente.'

// Erro da API no formato padrão: a mensagem para a tela e, no 400, os erros por campo.
export class ErroApi extends Error {
  status: number
  campos: Record<string, string[]>

  constructor(status: number, mensagem: string, campos: Record<string, string[]> = {}) {
    super(mensagem)
    this.status = status
    this.campos = campos
  }
}

let aoPerderSessao = () => {}

// A sessão registra aqui o que fazer quando a API responde 401.
export function definirAoPerderSessao(funcao: () => void) {
  aoPerderSessao = funcao
}

type Opcoes = {
  metodo?: string
  corpo?: unknown
}

export async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const temCorpo = opcoes.corpo !== undefined
  let resposta: Response

  try {
    resposta = await fetch('/api' + caminho, {
      method: opcoes.metodo ?? 'GET',
      headers: temCorpo ? { 'Content-Type': 'application/json' } : undefined,
      body: temCorpo ? JSON.stringify(opcoes.corpo) : undefined,
    })
  } catch {
    // Sem resposta nenhuma: rede fora ou servidor desligado.
    throw new ErroApi(0, MENSAGEM_INDISPONIVEL)
  }

  if (resposta.status === 204) {
    return undefined as T
  }

  // Com o backend fora do ar, o Caddy responde 502 sem JSON.
  const dados = await resposta.json().catch(() => null)

  if (resposta.ok) {
    return dados as T
  }

  if (resposta.status === 401) {
    aoPerderSessao()
  }

  throw new ErroApi(resposta.status, dados?.erro ?? MENSAGEM_INDISPONIVEL, dados?.campos)
}