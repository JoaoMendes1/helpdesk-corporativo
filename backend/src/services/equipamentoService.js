const { StatusEquipamento } = require('@prisma/client')
const prisma = require('../lib/prisma')
const ErroApp = require('../errors/ErroApp')

async function criar(dados, criadoPorId) {
    return prisma.equipamento.create({ data: { ...dados, criadoPorId } })
}

async function listar(filtros) {
    return prisma.equipamento.findMany({
        where: { status: filtros.status, tipo: filtros.tipo },
        orderBy: { id: 'asc' },
    })
}

async function buscarPorId(id) {
    const equipamento = await prisma.equipamento.findUnique({
        where: { id },
        include: {
            criadoPor: { select: { id: true, nome: true } },
            // A aprovação mais recente indica com quem o equipamento está.
            solicitacoes: {
                where: { status: 'APROVADA' },
                orderBy: { dtDecisao: 'desc' },
                take: 1,
                select: { id: true, dtDecisao: true, solicitante: { select: { id: true, nome: true } } },
            },
        },
    })

    if (!equipamento) {
        throw new ErroApp(404, 'Equipamento não encontrado.')
    }

    const { solicitacoes, criadoPorId, ...dados } = equipamento
    const aprovacao = solicitacoes[0]
    let emprestimoAtual = null

    if (equipamento.status === 'EMPRESTADO' && aprovacao) {
        emprestimoAtual = {
            solicitacaoId: aprovacao.id,
            solicitante: aprovacao.solicitante,
            dtDecisao: aprovacao.dtDecisao,
        }
    }

    return { ...dados, emprestimoAtual }
}

async function totais() {
    const grupos = await prisma.equipamento.groupBy({ by: ['status'], _count: { _all: true } })

    // O groupBy omite os status sem equipamento: todos começam em zero.
    const porStatus = {}
    for (const status of Object.values(StatusEquipamento)) {
        porStatus[status] = 0
    }

    let total = 0
    for (const grupo of grupos) {
        porStatus[grupo.status] = grupo._count._all
        total += grupo._count._all
    }

    return { total, porStatus }
}

module.exports = { criar, listar, buscarPorId, totais }