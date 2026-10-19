const ErroApp = require('../errors/ErroApp')
const { NOME_COOKIE, verificarToken } = require('../lib/token')

// Confere o token do cookie e disponibiliza o usuário em req.usuario para as camadas seguintes.
function autenticar(req, res, next) {
    const token = req.cookies[NOME_COOKIE]

    if (!token) {
        return next(new ErroApp(401, 'Faça login para continuar.'))
    }

    try {
        req.usuario = verificarToken(token)
    } catch {
        return next(new ErroApp(401, 'Sessão inválida ou expirada. Faça login novamente.'))
    }

    // Fora do try: um erro nas camadas seguintes não pode virar um 401.
    next()
}

module.exports = autenticar