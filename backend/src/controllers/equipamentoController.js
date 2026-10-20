const equipamentoService = require('../services/equipamentoService')

async function criar(req, res) {
    const equipamento = await equipamentoService.criar(req.validado.body, req.usuario.id)
    res.status(201).json(equipamento)
}

async function listar(req, res) {
    const equipamentos = await equipamentoService.listar(req.validado.query)
    res.json(equipamentos)
}

async function detalhar(req, res) {
    const equipamento = await equipamentoService.buscarPorId(req.validado.params.id)
    res.json(equipamento)
}

async function totais(req, res) {
    const resultado = await equipamentoService.totais()
    res.json(resultado)
}

module.exports = { criar, listar, detalhar, totais }