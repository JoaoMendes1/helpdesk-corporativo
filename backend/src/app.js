const express = require('express')

const app = express()

app.use(express.json())

// Utilizado pelo healthcheck do compose: responde quando a API estiver online. 
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

module.exports = app 