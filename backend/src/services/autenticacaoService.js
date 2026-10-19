const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')
const ErroApp = require('../errors/ErroApp')
const { gerarToken } = require('../lib/token')

// Comparado quando o e-mail não existe, para que a resposta leve o mesmo tempo de uma senha errada.
const HASH_FALSO = bcrypt.hashSync('hash-de-comparacao', 10)

async function login(email, senha) {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    const senhaConfere = await bcrypt.compare(senha, usuario ? usuario.senha : HASH_FALSO)

    // Mesma mensagem para os três casos, para não revelar quais e-mails estão cadastrados.
    if (!usuario || !senhaConfere || !usuario.ativo) {
        throw new ErroApp(401, 'E-mail ou senha inválidos.')
    }

    const dados = { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
    return { usuario: dados, token: gerarToken(dados) }
}

module.exports = { login }