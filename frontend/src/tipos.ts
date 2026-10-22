// Formato dos dados da API, como descrito em docs/API.md.
export type Perfil = 'SOLICITANTE' | 'APROVADOR'
export type StatusEquipamento = 'DISPONIVEL' | 'EMPRESTADO' | 'MANUTENCAO' | 'INATIVO'
export type StatusSolicitacao = 'PENDENTE' | 'APROVADA' | 'RECUSADA' | 'CANCELADA'

export type Usuario = {
  id: number
  nome: string
  perfil: Perfil
}

export type Pessoa = {
  id: number
  nome: string
}

export type Equipamento = {
  id: number
  marca: string
  modelo: string
  tipo: string
  status: StatusEquipamento
  dtCadastro: string
  criadoPorId: number
}

export type DetalheEquipamento = Omit<Equipamento, 'criadoPorId'> & {
  criadoPor: Pessoa
  emprestimoAtual: {
    solicitacaoId: number
    solicitante: Pessoa
    dtDecisao: string
  } | null
}

export type Totais = {
  total: number
  porStatus: Record<StatusEquipamento, number>
}

export type Solicitacao = {
  id: number
  tipoSolicitado: string
  marcaSolicitada: string | null
  modeloSolicitado: string | null
  descricao: string
  status: StatusSolicitacao
  dtSolicitacao: string
  solicitante: Pessoa
}