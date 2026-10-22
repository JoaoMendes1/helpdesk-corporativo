import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RotaProtegida } from './components/RotaProtegida'
import { useAutenticacao } from './hooks/useAutenticacao'
import { Equipamentos } from './pages/Equipamentos'
import { Painel } from './pages/Painel'
import { Login } from './pages/Login'
import { MinhasSolicitacoes } from './pages/MinhasSolicitacoes'
import { NovaSolicitacao } from './pages/NovaSolicitacao'
import { NovoEquipamento } from './pages/NovoEquipamento'
import { SolicitacoesPendentes } from './pages/SolicitacoesPendentes'

// O solicitante não vê o estoque: começa nas próprias solicitações.
function Inicio() {
  const { usuario } = useAutenticacao()
  return <Navigate to={usuario?.perfil === 'APROVADOR' ? '/painel' : '/solicitacoes'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />

          <Route element={<RotaProtegida perfil="APROVADOR" />}>
            <Route path="/painel" element={<Painel />} />
            <Route path="/equipamentos" element={<Equipamentos />} />
            <Route path="/equipamentos/novo" element={<NovoEquipamento />} />
            <Route path="/solicitacoes/pendentes" element={<SolicitacoesPendentes />} />
          </Route>

          <Route element={<RotaProtegida perfil="SOLICITANTE" />}>
            <Route path="/solicitacoes" element={<MinhasSolicitacoes />} />
            <Route path="/solicitacoes/nova" element={<NovaSolicitacao />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
