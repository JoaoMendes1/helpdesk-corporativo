const prisma = require('../lib/prisma')
const ErroApp = require('../errors/ErroApp')

// Formato das respostas: os registros ligados vêm só com os campos que a tela usa.
const INCLUIR = {
    solicitante: { select: { id: true, nome: true } },
    aprovador: { select: { id: true, nome: true } },
    equipamento: { select: { id: true, marca: true, modelo: true, tipo: true } },
    historicos: {
        orderBy: { dtRegistro: 'asc' },
        select: {
            id: true,
            statusAnterior: true,
            statusNovo: true,
            observacao: true,
            dtRegistro: true,
            usuario: { select: { id: true, nome: true } },
        },
    },
}

async function criar(dados, solicitanteId) {
    return prisma.solicitacao.create({
        data: {
            ...dados,
            solicitanteId,
            // A criação também entra no histórico, sem status anterior.
            historicos: { create: { usuarioId: solicitanteId, statusNovo: 'PENDENTE' } },
        },
        include: INCLUIR,
    })
}

async function listarMinhas(solicitanteId) {
    return prisma.solicitacao.findMany({
        where: { solicitanteId },
        orderBy: { dtSolicitacao: 'desc' },
        include: INCLUIR,
    })
}

async function listarPendentes() {
    return prisma.solicitacao.findMany({
        where: { status: 'PENDENTE' },
        orderBy: { dtSolicitacao: 'asc' },
        include: INCLUIR,
    })
}

async function cancelar(id, solicitanteId) {
    return prisma.$transaction(async (tx) => {
        // A solicitação de outro usuário responde como inexistente.
        const solicitacao = await tx.solicitacao.findFirst({ where: { id, solicitanteId } })
        if (!solicitacao) {
            throw new ErroApp(404, 'Solicitação não encontrada.')
        }

        // A condição no próprio UPDATE impede cancelar o que já mudou de status.
        const { count } = await tx.solicitacao.updateMany({
            where: { id, status: 'PENDENTE' },
            data: { status: 'CANCELADA' },
        })
        if (count === 0) {
            throw new ErroApp(409, 'A solicitação já não está pendente.')
        }

        await tx.historicoSolicitacao.create({
            data: { solicitacaoId: id, usuarioId: solicitanteId, statusAnterior: 'PENDENTE', statusNovo: 'CANCELADA' },
        })

        return tx.solicitacao.findUnique({ where: { id }, include: INCLUIR })
    })
}

async function aprovar(id, dados, aprovadorId) {
    const { equipamentoId, observacao } = dados

    return prisma.$transaction(async (tx) => {
        const solicitacao = await tx.solicitacao.findUnique({ where: { id } })
        if (!solicitacao) {
            throw new ErroApp(404, 'Solicitação não encontrada.')
        }

        const equipamento = await tx.equipamento.findUnique({ where: { id: equipamentoId } })
        if (!equipamento) {
            throw new ErroApp(422, 'Equipamento não encontrado.')
        }

        // Ordem fixa dos bloqueios (solicitação, depois equipamento), para evitar deadlock.
        const solicitacaoAlterada = await tx.solicitacao.updateMany({
            where: { id, status: 'PENDENTE' },
            data: { status: 'APROVADA', equipamentoId, aprovadorId, observacao, dtDecisao: new Date() },
        })
        if (solicitacaoAlterada.count === 0) {
            throw new ErroApp(409, 'A solicitação já não está pendente.')
        }

        // O erro desfaz a alteração da solicitação, que volta a PENDENTE.
        const equipamentoAlterado = await tx.equipamento.updateMany({
            where: { id: equipamentoId, status: 'DISPONIVEL' },
            data: { status: 'EMPRESTADO' },
        })
        if (equipamentoAlterado.count === 0) {
            throw new ErroApp(409, 'O equipamento escolhido já não está disponível.')
        }

        await tx.historicoSolicitacao.create({
            data: { solicitacaoId: id, usuarioId: aprovadorId, statusAnterior: 'PENDENTE', statusNovo: 'APROVADA', observacao },
        })

        return tx.solicitacao.findUnique({ where: { id }, include: INCLUIR })
    })
}

async function recusar(id, observacao, aprovadorId) {
    return prisma.$transaction(async (tx) => {
        const solicitacao = await tx.solicitacao.findUnique({ where: { id } })
        if (!solicitacao) {
            throw new ErroApp(404, 'Solicitação não encontrada.')
        }

        const { count } = await tx.solicitacao.updateMany({
            where: { id, status: 'PENDENTE' },
            data: { status: 'RECUSADA', aprovadorId, observacao, dtDecisao: new Date() },
        })
        if (count === 0) {
            throw new ErroApp(409, 'A solicitação já não está pendente.')
        }

        await tx.historicoSolicitacao.create({
            data: { solicitacaoId: id, usuarioId: aprovadorId, statusAnterior: 'PENDENTE', statusNovo: 'RECUSADA', observacao },
        })

        return tx.solicitacao.findUnique({ where: { id }, include: INCLUIR })
    })
}

module.exports = { criar, listarMinhas, listarPendentes, cancelar, aprovar, recusar }
