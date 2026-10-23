import { NavLink, Outlet } from 'react-router'
import { useAutenticacao } from '../hooks/useAutenticacao'
import { CLASSE_BOTAO_SECUNDARIO } from '../lib/estilos'
import type { Perfil } from '../tipos'
import { Icone, type NomeIcone } from './Icone'

type Item = {
  para: string
  texto: string
  icone: NomeIcone
}

type Grupo = {
  titulo?: string
  itens: Item[]
}

// O menu de cada perfil. O solicitante não vê o estoque.
const MENU: Record<Perfil, Grupo[]> = {
  APROVADOR: [
    { itens: [{ para: '/painel', texto: 'Painel', icone: 'painel' }] },
    {
      titulo: 'Inventário',
      itens: [
        { para: '/equipamentos', texto: 'Equipamentos', icone: 'equipamento' },
        { para: '/equipamentos/novo', texto: 'Novo equipamento', icone: 'mais' },
      ],
    },
    { titulo: 'Solicitações', itens: [{ para: '/solicitacoes/pendentes', texto: 'Pendentes', icone: 'caixa' }] },
  ],
  SOLICITANTE: [
    {
      titulo: 'Solicitações',
      itens: [
        { para: '/solicitacoes', texto: 'Minhas solicitações', icone: 'lista' },
        { para: '/solicitacoes/nova', texto: 'Nova solicitação', icone: 'mais' },
      ],
    },
  ],
}

// "Ana Souza" vira "AS".
function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
}

// Cabeçalho e menu em volta das telas de quem está logado.
export function Layout() {
  const { usuario, sair } = useAutenticacao()

  // A RotaProtegida já garante o usuário; o if satisfaz o TypeScript.
  if (!usuario) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-linha bg-superficie shadow-sm">
        <div className="flex h-full w-16 flex-none items-center gap-2.5 pl-4 md:w-60 md:pl-5.5">
          <span className="grid size-8 flex-none place-items-center rounded-[9px] bg-azul" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-destaque" />
          </span>
          <span className="hidden flex-col leading-tight md:flex">
            <b className="text-[17px] font-extrabold tracking-tight text-azul">HelpDesk</b>
            <small className="text-[10.5px] font-bold uppercase tracking-wider text-suave">Corporativo</small>
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3.5 pr-3 md:pr-6">
          <div className="hidden text-right leading-tight sm:block">
            <b className="block text-[13px]">{usuario.nome}</b>
            <small className="text-[11.5px] text-suave">{usuario.perfil === 'APROVADOR' ? 'Aprovador' : 'Solicitante'}</small>
          </div>
          <span className="grid size-9.5 flex-none place-items-center rounded-full bg-marca-claro text-[13px] font-extrabold text-marca-texto" aria-hidden="true">
            {iniciais(usuario.nome)}
          </span>
          <button type="button" onClick={sair} className={CLASSE_BOTAO_SECUNDARIO}>
            <Icone nome="sair" tamanho={16} />
            Sair
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-linha bg-menu">
          <nav aria-label="Menu principal" className="flex flex-col gap-0.5 px-2.5 py-4">
            {MENU[usuario.perfil].map((grupo, indice) => (
              <div key={indice} className="flex flex-col gap-0.5">
                {grupo.titulo && (
                  <p className="mx-2.5 mb-1.5 mt-3.5 hidden text-[10.5px] font-extrabold uppercase tracking-wider text-suave md:block">{grupo.titulo}</p>
                )}
                {grupo.itens.map((item) => (
                  <NavLink
                    key={item.para}
                    to={item.para}
                    end
                    title={item.texto}
                    className="flex items-center justify-center gap-2.5 rounded-md px-2.5 py-2.5 text-[13.5px] font-semibold text-texto hover:bg-hover aria-[current=page]:bg-marca-claro aria-[current=page]:text-marca-texto md:justify-start"
                  >
                    <Icone nome={item.icone} />
                    <span className="hidden md:inline">{item.texto}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 px-4 pb-12 pt-6.5 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}