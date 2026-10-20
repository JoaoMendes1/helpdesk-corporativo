const { z } = require('zod')

// Maior valor que a coluna INT do MySQL aceita.
const MAIOR_ID = 2147483647

// Só dígitos: z.coerce.number() aceitaria "0x10" e "1e3" como números válidos.
const schemaId = z.object({
    id: z
        .string()
        .regex(/^\d+$/, { error: 'Informe um id válido.' })
        .transform(Number)
        .refine((id) => id >= 1 && id <= MAIOR_ID, { error: 'Informe um id válido.' }),
})

module.exports = { schemaId }