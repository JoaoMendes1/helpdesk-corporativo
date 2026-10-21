const { z } = require('zod')
const { MAIOR_ID } = require('./id')

// Tamanho das colunas de texto no banco (VARCHAR(191)).
const MAX_TEXTO = 191

// A observação fica numa coluna TEXT; o limite impede corpos excessivos.
const MAX_OBSERVACAO = 1000

const schemaNovaSolicitacao = z.object({
    // Em minúsculas, para comparar com o tipo dos equipamentos.
    tipoSolicitado: z
        .string({ error: 'Informe o tipo do equipamento.' })
        .trim()
        .toLowerCase()
        .min(1, { error: 'Informe o tipo do equipamento.' })
        .max(MAX_TEXTO, { error: `O tipo pode ter no máximo ${MAX_TEXTO} caracteres.` }),
    descricao: z
        .string({ error: 'Descreva o motivo do pedido.' })
        .trim()
        .min(1, { error: 'Descreva o motivo do pedido.' })
        .max(MAX_TEXTO, { error: `A descrição pode ter no máximo ${MAX_TEXTO} caracteres.` }),
    // Opcionais: texto vazio vira undefined, e a coluna fica nula.
    marcaSolicitada: z
        .string({ error: 'Informe a marca como texto.' })
        .trim()
        .max(MAX_TEXTO, { error: `A marca pode ter no máximo ${MAX_TEXTO} caracteres.` })
        .transform((marca) => marca || undefined)
        .optional(),
    modeloSolicitado: z
        .string({ error: 'Informe o modelo como texto.' })
        .trim()
        .max(MAX_TEXTO, { error: `O modelo pode ter no máximo ${MAX_TEXTO} caracteres.` })
        .transform((modelo) => modelo || undefined)
        .optional(),
})

const schemaAprovacao = z.object({
    equipamentoId: z
        .number({ error: 'Escolha o equipamento para aprovar.' })
        .int({ error: 'Informe um equipamento válido.' })
        .min(1, { error: 'Informe um equipamento válido.' })
        .max(MAIOR_ID, { error: 'Informe um equipamento válido.' }),
    observacao: z
        .string({ error: 'Informe a observação como texto.' })
        .trim()
        .max(MAX_OBSERVACAO, { error: `A observação pode ter no máximo ${MAX_OBSERVACAO} caracteres.` })
        .transform((observacao) => observacao || undefined)
        .optional(),
})

const schemaRecusa = z.object({
    observacao: z
        .string({ error: 'Informe a justificativa da recusa.' })
        .trim()
        .min(1, { error: 'Informe a justificativa da recusa.' })
        .max(MAX_OBSERVACAO, { error: `A justificativa pode ter no máximo ${MAX_OBSERVACAO} caracteres.` }),
})

module.exports = { schemaNovaSolicitacao, schemaAprovacao, schemaRecusa }
