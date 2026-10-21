// Dados fictícios 

const bcrypt = require('bcryptjs')
const prisma = require('../src/lib/prisma')

const SENHA_DE_TESTE = 'Senha@123'

// Datas antigas 
function diasAtras(dias) {
    return new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
}

async function main() {
    const usuarios = await prisma.usuario.count()
    if (usuarios > 0) {
        console.log('Seed ignorado: Contém dados no banco')
        return
    }

    const senha = await bcrypt.hash(SENHA_DE_TESTE, 10)

    // Usuários e equipamentos cadastrados antes de todas as solicitações.
    const cadastro = diasAtras(30)

    // Se falhar próximo boot tenta novamente
    await prisma.$transaction(async (tx) => {
        const ana = await tx.usuario.create({
            data: { nome: 'Ana Souza', email: 'aprovador@example.com', senha, perfil: 'APROVADOR', dtCadastro: cadastro },
        })
        const bruno = await tx.usuario.create({
            data: { nome: 'Bruno Lima', email: 'solicitante@example.com', senha, dtCadastro: cadastro },
        })
        const cristina = await tx.usuario.create({
            data: { nome: 'Cristina Rocha', email: 'cristina@example.com', senha, dtCadastro: cadastro },
        })
        await tx.usuario.create({
            data: { nome: 'Ronaldo Souza', email: 'inativo@example.com', senha, ativo: false, dtCadastro: cadastro }
        })

        // O equipamento emprestado na solicitação aprovada é criado à parte, para obter o id.
        const thinkpad = await tx.equipamento.create({
            data: { marca: 'Lenovo', modelo: 'ThinkPad E14', tipo: 'notebook', status: 'EMPRESTADO', criadoPorId: ana.id, dtCadastro: cadastro },
        })
        await tx.equipamento.createMany({
            data: [
                { marca: 'Dell', modelo: 'Latitude 5440', tipo: 'notebook', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'HP', modelo: 'EliteBook 840', tipo: 'notebook', status: 'MANUTENCAO', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'Dell', modelo: 'P2422H', tipo: 'monitor', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'LG', modelo: '24MK430H', tipo: 'monitor', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'Logitech', modelo: 'MK270', tipo: 'teclado e mouse', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'Samsung', modelo: 'Galaxy A15', tipo: 'celular', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'Apple', modelo: 'iPad 10', tipo: 'tablet', status: 'INATIVO', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'Epson', modelo: 'L3250', tipo: 'impressora', status: 'MANUTENCAO', criadoPorId: ana.id, dtCadastro: cadastro },
                { marca: 'Dell', modelo: 'OptiPlex 7010', tipo: 'desktop', criadoPorId: ana.id, dtCadastro: cadastro },
            ],
        })

        // Aprovada: o aprovador escolheu o equipamento, que agora está emprestado.
        await tx.solicitacao.create({
            data: {
                solicitanteId: bruno.id,
                equipamentoId: thinkpad.id,
                descricao: 'Notebook para o trabalho remoto.',
                tipoSolicitado: 'notebook',
                status: 'APROVADA',
                observacao: 'Liberado para o home office.',
                dtSolicitacao: diasAtras(10),
                dtDecisao: diasAtras(9),
                aprovadorId: ana.id,
                historicos: {
                    create: [
                        { usuarioId: bruno.id, statusNovo: 'PENDENTE', dtRegistro: diasAtras(10) },
                        {
                            usuarioId: ana.id,
                            statusAnterior: 'PENDENTE',
                            statusNovo: 'APROVADA',
                            observacao: 'Liberado para o home office.',
                            dtRegistro: diasAtras(9),
                        },
                    ],
                },
            },
        })

        // Recusada, com a justificativa.
        await tx.solicitacao.create({
            data: {
                solicitanteId: bruno.id,
                descricao: 'Notebook para edição de vídeo.',
                marcaSolicitada: 'Apple',
                modeloSolicitado: 'MacBook Pro',
                tipoSolicitado: 'notebook',
                status: 'RECUSADA',
                observacao: 'Não há MacBook no estoque; o notebook padrão atende ao uso.',
                dtSolicitacao: diasAtras(6),
                dtDecisao: diasAtras(5),
                aprovadorId: ana.id,
                historicos: {
                    create: [
                        { usuarioId: bruno.id, statusNovo: 'PENDENTE', dtRegistro: diasAtras(6) },
                        {
                            usuarioId: ana.id,
                            statusAnterior: 'PENDENTE',
                            statusNovo: 'RECUSADA',
                            observacao: 'Não há MacBook no estoque; o notebook padrão atende ao uso.',
                            dtRegistro: diasAtras(5),
                        },
                    ],
                },
            },
        })
        // Cancelada pela própria solicitante, enquanto ainda estava pendente.
        await tx.solicitacao.create({
            data: {
                solicitanteId: cristina.id,
                descricao: 'Kit de teclado e mouse.',
                tipoSolicitado: 'teclado e mouse',
                status: 'CANCELADA',
                dtSolicitacao: diasAtras(4),
                historicos: {
                    create: [
                        { usuarioId: cristina.id, statusNovo: 'PENDENTE', dtRegistro: diasAtras(4) },
                        {
                            usuarioId: cristina.id,
                            statusAnterior: 'PENDENTE',
                            statusNovo: 'CANCELADA',
                            dtRegistro: diasAtras(3),
                        },
                    ],
                },
            },
        })

        // Duas pendentes, uma de cada solicitante.
        await tx.solicitacao.create({
            data: {
                solicitanteId: cristina.id,
                descricao: 'Notebook para um treinamento externo.',
                tipoSolicitado: 'notebook',
                dtSolicitacao: diasAtras(2),
                historicos: {
                    create: [{ usuarioId: cristina.id, statusNovo: 'PENDENTE', dtRegistro: diasAtras(2) }],
                },
            },
        })
        await tx.solicitacao.create({
            data: {
                solicitanteId: bruno.id,
                descricao: 'Monitor extra para a mesa.',
                tipoSolicitado: 'monitor',
                dtSolicitacao: diasAtras(1),
                historicos: {
                    create: [{ usuarioId: bruno.id, statusNovo: 'PENDENTE', dtRegistro: diasAtras(1) }],
                },
            },
        })

    })

    console.log('Seed concluído: usuários, equipamentos e solicitações de teste criados.')
}

main()
    .catch((erro) => {
        console.error('Seed falhou:', erro)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
