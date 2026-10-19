// Erro previsto pela aplicação, com o status HTTP da resposta e, opcionalmente, os erros por campo.
class ErroApp extends Error {
    constructor(status, mensagem, campos) {
        super(mensagem)
        this.status = status
        this.campos = campos
    }
}

module.exports = ErroApp