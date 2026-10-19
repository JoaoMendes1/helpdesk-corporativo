const { Prisma } = require('@prisma/client')
const ErroApp = require('../errors/ErroApp')

// Códigos do Prisma que indicam banco inacessível ou conexão perdida.
const CODIGOS_BANCO_INDISPONIVEL = ['P1001', 'P1002', 'P1017', 'P2024']

// Converte qualquer erro na resposta padronizada da API. O Express identifica o middleware de
// erro pelos quatro parâmetros, por isso o next permanece mesmo sem uso.
function tratarErros(erro, req, res, next) {
    if (erro instanceof ErroApp) {
        return res.status(erro.status).json({ erro: erro.message, campos: erro.campos })
    }

    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido.' })
    }

    const bancoIndisponivel =
        erro instanceof Prisma.PrismaClientInitializationError ||
        (erro instanceof Prisma.PrismaClientKnownRequestError &&
            CODIGOS_BANCO_INDISPONIVEL.includes(erro.code))

    // O detalhe do erro vai apenas para o log, nunca para a resposta.
    console.error(erro)

    if (bancoIndisponivel) {
        return res.status(503).json({ erro: 'Serviço temporariamente indisponível. Tente novamente.' })
    }

    res.status(500).json({ erro: 'Erro interno do servidor.' })
}

module.exports = tratarErros