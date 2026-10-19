const { Router } = require('express')
const autenticar = require('../middlewares/autenticar')
const validar = require('../middlewares/validar')
const { schemaLogin } = require('../schemas/login')
const autenticacaoController = require('../controllers/autenticacaoController')

const router = Router()

router.post('/login', validar(schemaLogin), autenticacaoController.login)
router.get('/me', autenticar, autenticacaoController.me)
router.post('/logout', autenticar, autenticacaoController.logout)

module.exports = router