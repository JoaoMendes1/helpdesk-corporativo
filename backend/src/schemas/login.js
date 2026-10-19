const { z } = require('zod')

const schemaLogin = z.object({
    // Remove os espaços e padroniza em minúsculas antes de validar o formato.
    email: z
        .string({ error: 'Informe um e-mail válido.' })
        .trim()
        .toLowerCase()
        .pipe(z.email({ error: 'Informe um e-mail válido.' })),
    senha: z.string({ error: 'Informe a senha.' }).min(1, { error: 'Informe a senha.' }),
})

module.exports = { schemaLogin }