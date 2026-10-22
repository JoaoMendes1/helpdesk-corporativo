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

export type Historico = {
  id: number
  statusAnterior: StatusSolicitacao | null
  statusNovo: StatusSolicitacao
  observacao: string | null
  dtRegistro: string
  usuario: Pessoa
}

export type Solicitacao = {
  id: number
  solicitanteId: number
  equipamentoId: number | null
  descricao: string
  marcaSolicitada: string | null
  modeloSolicitado: string | null
  tipoSolicitado: string
  status: StatusSolicitacao
  observacao: string | null
  dtSolicitacao: string
  dtDecisao: string | null
  aprovadorId: number | null
  solicitante: Pessoa
  aprovador: Pessoa | null
  equipamento: Pick<Equipamento, 'id' | 'marca' | 'modelo' | 'tipo'> | null
  historicos: Historico[]
}
