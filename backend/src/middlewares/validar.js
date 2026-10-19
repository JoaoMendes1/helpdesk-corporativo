const { z } = require('zod')
const ErroApp = require('../errors/ErroApp')

// Valida o corpo da requisição com o schema informado e o substitui pelos dados validados.
function validar(schema) {
    return (req, res, next) => {
        // Sem corpo, o Express 5 entrega undefined; o objeto vazio gera as mensagens por campo.
        const resultado = schema.safeParse(req.body ?? {})

        if (!resultado.success) {
            const campos = z.flattenError(resultado.error).fieldErrors
            return next(new ErroApp(400, 'Dados inválidos.', campos))
        }

        req.body = resultado.data
        next()
    }
}

module.exports = validar