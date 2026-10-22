import { useEffect, useState, type ReactNode } from 'react'
import { AutenticacaoContext } from '../hooks/useAutenticacao'
import { definirAoPerderSessao, requisitar } from '../lib/api'
import type { Usuario } from '../tipos'

type RespostaUsuario = {
  usuario: Usuario
}

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Qualquer 401 da API encerra a sessão na tela.
    definirAoPerderSessao(() => setUsuario(null))

    // O cookie é httpOnly: só a API sabe quem está logado.
    requisitar<RespostaUsuario>('/me')
      .then((dados) => setUsuario(dados.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false))
  }, [])

  async function entrar(email: string, senha: string) {
    const dados = await requisitar<RespostaUsuario>('/login', { metodo: 'POST', corpo: { email, senha } })
    setUsuario(dados.usuario)
  }

  async function sair() {
    // Mesmo se a API falhar, a tela volta ao login.
    await requisitar('/logout', { metodo: 'POST' }).catch(() => {})
    setUsuario(null)
  }

  return (
    <AutenticacaoContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AutenticacaoContext.Provider>
  )
}