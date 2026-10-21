const { Router } = require('express')
const exigirPerfil = require('../middlewares/exigirPerfil')
const validar = require('../middlewares/validar')
const { schemaId } = require('../schemas/id')
const { schemaNovaSolicitacao, schemaAprovacao, schemaRecusa } = require('../schemas/solicitacao')
const solicitacaoController = require('../controllers/solicitacaoController')

const router = Router()

// Exigido em cada rota: com router.use, valeria para toda a /api, inclusive outros routers.
const soSolicitante = exigirPerfil('SOLICITANTE')
const soAprovador = exigirPerfil('APROVADOR')

router.post('/solicitacoes', soSolicitante, validar(schemaNovaSolicitacao), solicitacaoController.criar)
router.get('/solicitacoes/minhas', soSolicitante, solicitacaoController.listarMinhas)
router.get('/solicitacoes/pendentes', soAprovador, solicitacaoController.listarPendentes)
router.post('/solicitacoes/:id/cancelamento', soSolicitante, validar(schemaId, 'params'), solicitacaoController.cancelar)
router.post('/solicitacoes/:id/aprovacao', soAprovador, validar(schemaId, 'params'), validar(schemaAprovacao), solicitacaoController.aprovar)
router.post('/solicitacoes/:id/recusa', soAprovador, validar(schemaId, 'params'), validar(schemaRecusa), solicitacaoController.recusar)

module.exports = router
