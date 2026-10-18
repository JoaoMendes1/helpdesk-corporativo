const { port } = require('./config/env')
const app = require('./app')

app.listen(port, () => {
    console.log(`API ouvindo na porta ${port}`)
})