const { z } = require('zod')
const ErroApp = require('../errors/ErroApp')

// Valida uma parte da requisição (body, query ou params) e guarda o resultado em req.validado. 
function validar(schema, origem = 'body') {
    return (req, res, next) => {
        // Sem corpo, o Express 5 entrega undefined; o objeto vazio gera as mensagens por campo.
        const resultado = schema.safeParse(req[origem] ?? {})

        if (!resultado.success) {
            const campos = z.flattenError(resultado.error).fieldErrors
            return next(new ErroApp(400, 'Dados inválidos.', campos))
        }
        // Não substitui req.query: no Express 5, essa atribuição é descartada sem erro.
        req.validado = req.validado ?? {}
        req.validado[origem] = resultado.data
        next()
    }
}

module.exports = validar