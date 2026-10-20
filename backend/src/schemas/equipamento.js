const { z } = require('zod')
const { StatusEquipamento } = require('@prisma/client')

// Tamanho das colunas de texto no banco (VARCHAR(191)).
const MAX_TEXTO = 191

const MENSAGEM_STATUS = 'Status inválido. Use DISPONIVEL, EMPRESTADO, MANUTENCAO ou INATIVO.'

const schemaNovoEquipamento = z.object({
    marca: z
        .string({ error: 'Informe a marca.' })
        .trim()
        .min(1, { error: 'Informe a marca.' })
        .max(MAX_TEXTO, { error: `A marca pode ter no máximo ${MAX_TEXTO} caracteres.` }),
    modelo: z
        .string({ error: 'Informe o modelo.' })
        .trim()
        .min(1, { error: 'Informe o modelo.' })
        .max(MAX_TEXTO, { error: `O modelo pode ter no máximo ${MAX_TEXTO} caracteres.` }),
    // Em minúsculas, "Notebook" e "notebook" são o mesmo tipo nos filtros.
    tipo: z
        .string({ error: 'Informe o tipo.' })
        .trim()
        .toLowerCase()
        .min(1, { error: 'Informe o tipo.' })
        .max(MAX_TEXTO, { error: `O tipo pode ter no máximo ${MAX_TEXTO} caracteres.` }),
    // Sem status, o banco aplica o padrão DISPONIVEL.
    status: z.enum(StatusEquipamento, { error: MENSAGEM_STATUS }).optional(),
})

const schemaFiltrosEquipamentos = z.object({
    status: z.enum(StatusEquipamento, { error: MENSAGEM_STATUS }).optional(),
    // Tipo vazio vira undefined, e o Prisma ignora o filtro.
    tipo: z
        .string({ error: 'Informe um único tipo.' })
        .trim()
        .toLowerCase()
        .transform((tipo) => tipo || undefined)
        .optional(),
})

module.exports = { schemaNovoEquipamento, schemaFiltrosEquipamentos }