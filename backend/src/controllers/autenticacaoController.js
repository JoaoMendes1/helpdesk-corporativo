const { cookieSecure } = require('../config/env')
const { NOME_COOKIE, DURACAO_SEGUNDOS } = require('../lib/token')
const autenticacaoService = require('../services/autenticacaoService')

// httpOnly: inacessível ao JavaScript. sameSite: não enviado em requisições de outros sites.
const opcoesCookie = {
    httpOnly: true,
    sameSite: 'strict',
    secure: cookieSecure,
    path: '/api',
}

async function login(req, res) {
    const { usuario, token } = await autenticacaoService.login(req.body.email, req.body.senha)

    res.cookie(NOME_COOKIE, token, { ...opcoesCookie, maxAge: DURACAO_SEGUNDOS * 1000 })
    res.json({ usuario })
}

function me(req, res) {
    res.json({ usuario: req.usuario })
}

// O navegador só remove o cookie se as opções forem as mesmas usadas na criação.
function logout(req, res) {
    res.clearCookie(NOME_COOKIE, opcoesCookie)
    res.status(204).end()
}

module.exports = { login, me, logout }