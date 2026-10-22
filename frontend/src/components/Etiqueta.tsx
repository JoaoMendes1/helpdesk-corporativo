import { ROTULO_STATUS_EQUIPAMENTO, ROTULO_STATUS_SOLICITACAO } from '../lib/formatos'
import type { StatusEquipamento, StatusSolicitacao } from '../tipos'

type Status = StatusEquipamento | StatusSolicitacao

// As mesmas cores do protótipo: verde, azul, amarelo, cinza e vermelho.
const CORES: Record<Status, string> = {
  DISPONIVEL: 'bg-ok-fundo text-ok-texto',
  APROVADA: 'bg-ok-fundo text-ok-texto',
  EMPRESTADO: 'bg-info-fundo text-info-texto',
  MANUTENCAO: 'bg-aviso-fundo text-aviso-texto',
  PENDENTE: 'bg-aviso-fundo text-aviso-texto',
  INATIVO: 'bg-neutro-fundo text-neutro-texto',
  CANCELADA: 'bg-neutro-fundo text-neutro-texto',
  RECUSADA: 'bg-erro-fundo text-erro-texto',
}

const ROTULOS: Record<Status, string> = { ...ROTULO_STATUS_EQUIPAMENTO, ...ROTULO_STATUS_SOLICITACAO }

export function Etiqueta({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ${CORES[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {ROTULOS[status]}
    </span>
  )
}