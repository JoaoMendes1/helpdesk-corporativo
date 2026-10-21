const solicitacaoService = require('../services/solicitacaoService')

async function criar(req, res) {
    const solicitacao = await solicitacaoService.criar(req.validado.body, req.usuario.id)
    res.status(201).json(solicitacao)
}

async function listarMinhas(req, res) {
    const solicitacoes = await solicitacaoService.listarMinhas(req.usuario.id)
    res.json(solicitacoes)
}

async function listarPendentes(req, res) {
    const solicitacoes = await solicitacaoService.listarPendentes()
    res.json(solicitacoes)
}

async function cancelar(req, res) {
    const solicitacao = await solicitacaoService.cancelar(req.validado.params.id, req.usuario.id)
    res.json(solicitacao)
}

async function aprovar(req, res) {
    const solicitacao = await solicitacaoService.aprovar(req.validado.params.id, req.validado.body, req.usuario.id)
    res.json(solicitacao)
}

async function recusar(req, res) {
    const solicitacao = await solicitacaoService.recusar(req.validado.params.id, req.validado.body.observacao, req.usuario.id)
    res.json(solicitacao)
}

module.exports = { criar, listarMinhas, listarPendentes, cancelar, aprovar, recusar }
