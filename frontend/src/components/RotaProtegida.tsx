import { Link, Navigate, Outlet } from 'react-router'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { CLASSE_BOTAO_SECUNDARIO } from '../lib/estilos'
import type { Perfil } from '../tipos'

type Props = {
  perfil?: Perfil
}

// Sem login, leva ao login. Com o perfil errado, avisa. A regra real é o 403 da API.
export function RotaProtegida({ perfil }: Props) {
  const { usuario, carregando } = useAutenticacao()

  if (carregando) {
    return <p className="p-10 text-suave">Carregando…</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (perfil && usuario.perfil !== perfil) {
    return (
      <div className="rounded-xl border border-dashed border-linha-forte bg-superficie px-5 py-12 text-center text-suave">
        <h2 className="mb-1.5 text-base font-bold text-texto">Seu perfil não tem permissão para esta ação.</h2>
        <p>Esta tela é do perfil {perfil === 'APROVADOR' ? 'aprovador' : 'solicitante'}.</p>
        <Link to="/" className={`${CLASSE_BOTAO_SECUNDARIO} mt-4`}>
          Voltar ao início
        </Link>
      </div>
    )
  }

  return <Outlet />
}