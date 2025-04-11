module.exports = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
      return next(); // Usuario autenticado, continúa
    }
  
    // Usuario no autenticado, redirige al login
    res.redirect('/auth/login');
  };
  