function authMiddleware(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/usuario/login'); 
    }
}

function adminMiddleware(req, res, next) {
    if (req.session.user && req.session.user.rol === 'admin') {
        next();
    } else {
        res.redirect('/'); 
    }
}
function secretariaMiddleware(req, res, next) {
    if (req.session.user && req.session.user.rol === 'secretaria') {
        next();
    } else {
        res.redirect('/'); 
    }
}
function pacienteMiddleware(req, res, next) {
    if (req.session.user && req.session.user.rol === 'paciente') {
        next();
    } else {
        res.redirect('/'); 
    }
}
function userMiddleware(req, res, next) {
    res.locals.user = req.session.user;
    next();
  }
module.exports = { authMiddleware, adminMiddleware, secretariaMiddleware,pacienteMiddleware,userMiddleware };