const ErroApp = require('../errors/ErroApp')

// Restringe a rota a um perfil. Depende de req.usuario, preenchido pelo autenticar.
function exigirPerfil(perfil) {
    return (req, res, next) => {
        if (req.usuario.perfil !== perfil) {
            return next(new ErroApp(403, 'Seu perfil não tem permissão para esta ação.'))
        }

        next()
    }
}

module.exports = exigirPerfil