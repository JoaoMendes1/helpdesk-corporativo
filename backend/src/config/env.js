// Confere as variáveis no boot. Faltando uma obrigatória, o processo para com o nome dela no
// log, em vez de falhar depois, no meio de uma requisição.
const obrigatorias = ['DATABASE_URL']

for (const nome of obrigatorias) {
  if (!process.env[nome]) {
    console.error(`Variável de ambiente obrigatória ausente: ${nome}`)
    process.exit(1)
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
}