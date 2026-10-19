// Valida as variáveis obrigatórias na inicialização, antes de receber requisições.
const obrigatorias = ['DATABASE_URL', 'JWT_SECRET']

for (const nome of obrigatorias) {
    if (!process.env[nome]) {
        console.error(`Variável de ambiente obrigatória ausente: ${nome}`)
        process.exit(1)
    }
}

if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET precisa ter pelo menos 32 caracteres')
    process.exit(1)
}

module.exports = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    // Variáveis de ambiente são texto: apenas o valor "true" ativa a opção.
    cookieSecure: process.env.COOKIE_SECURE === 'true',
}