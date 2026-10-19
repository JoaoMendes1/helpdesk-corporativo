const express = require('express')
const cookieParser = require('cookie-parser')
const ErroApp = require('./errors/ErroApp')
const autenticar = require('./middlewares/autenticar')
const tratarErros = require('./middlewares/tratarErros')
const autenticacaoRoutes = require('./routes/autenticacaoRoutes')

const app = express()

// Omite o cabeçalho que identifica o servidor como Express.
app.disable('x-powered-by')
app.use(express.json())
app.use(cookieParser())

// Utilizado pelo healthcheck do compose: responde quando a API estiver online.
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api', autenticacaoRoutes)

// Toda rota registrada a partir daqui exige login.
app.use('/api', autenticar)

// Requisição que nenhuma rota atendeu.
app.use((req, res, next) => {
    next(new ErroApp(404, 'Rota não encontrada.'))
})

app.use(tratarErros)

module.exports = app