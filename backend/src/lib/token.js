const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/env')

const NOME_COOKIE = 'token'
const DURACAO_SEGUNDOS = 8 * 60 * 60

function gerarToken(usuario) {
    return jwt.sign({ nome: usuario.nome, perfil: usuario.perfil }, jwtSecret, {
        subject: String(usuario.id),
        expiresIn: DURACAO_SEGUNDOS,
        algorithm: 'HS256',
    })
}

// Fixa o algoritmo aceito: o cabeçalho do token não define como ele é verificado.
function verificarToken(token) {
    const dados = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] })
    return { id: Number(dados.sub), nome: dados.nome, perfil: dados.perfil }
}

module.exports = { NOME_COOKIE, DURACAO_SEGUNDOS, gerarToken, verificarToken }