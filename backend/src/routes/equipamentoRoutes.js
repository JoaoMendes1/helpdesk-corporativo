const { Router } = require('express')
const exigirPerfil = require('../middlewares/exigirPerfil')
const validar = require('../middlewares/validar')
const { schemaId } = require('../schemas/id')
const { schemaNovoEquipamento, schemaFiltrosEquipamentos } = require('../schemas/equipamento')
const equipamentoController = require('../controllers/equipamentoController')

const router = Router()

// Exigido em cada rota: com router.use, valeria para toda a /api, inclusive outros routers.
const soAprovador = exigirPerfil('APROVADOR')

router.post('/novo-equipamento', soAprovador, validar(schemaNovoEquipamento), equipamentoController.criar)
router.get('/equipamentos', soAprovador, validar(schemaFiltrosEquipamentos, 'query'), equipamentoController.listar)
router.get('/equipamentos/totais', soAprovador, equipamentoController.totais)
router.get('/equipamento/:id', soAprovador, validar(schemaId, 'params'), equipamentoController.detalhar)

module.exports = router