import type { Solicitacao, StatusEquipamento, StatusSolicitacao } from '../tipos'

export const ROTULO_STATUS_EQUIPAMENTO: Record<StatusEquipamento, string> = {
  DISPONIVEL: 'Disponível',
  EMPRESTADO: 'Emprestado',
  MANUTENCAO: 'Em manutenção',
  INATIVO: 'Inativo',
}

export const ROTULO_STATUS_SOLICITACAO: Record<StatusSolicitacao, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada',
}

// Na ordem em que aparecem no painel e nos filtros.
export const STATUS_EQUIPAMENTO: StatusEquipamento[] = ['DISPONIVEL', 'EMPRESTADO', 'MANUTENCAO', 'INATIVO']

// A API devolve datas em UTC; a tela mostra a data local, como 21/10/2026.
export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

// O tipo é gravado em minúsculas: "notebook" aparece como "Notebook".
export function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// O título de um pedido: o tipo e, se informados, a marca e o modelo. Ex.: "Notebook · Apple MacBook Pro".
export function tituloSolicitacao(solicitacao: Solicitacao) {
  const marcaModelo = [solicitacao.marcaSolicitada, solicitacao.modeloSolicitado].filter(Boolean).join(' ')
  return marcaModelo ? `${capitalizar(solicitacao.tipoSolicitado)} · ${marcaModelo}` : capitalizar(solicitacao.tipoSolicitado)
}