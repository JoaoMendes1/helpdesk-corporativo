import { createContext, useContext } from 'react'
import type { Usuario } from '../tipos'

export type Sessao = {
  usuario: Usuario | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
}

// Preenchido pelo AutenticacaoProvider, em volta de todo o app.
export const AutenticacaoContext = createContext<Sessao | null>(null)

export function useAutenticacao() {
  const sessao = useContext(AutenticacaoContext)

  if (!sessao) {
    throw new Error('useAutenticacao precisa estar dentro do AutenticacaoProvider.')
  }

  return sessao
}