const Usuario = require('../models/Usuario');


exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Admin Login',
    error: null,
    correo: ''
  });
};

exports.postLogin = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario || usuario.contraseña !== contraseña) {
      return res.render('login', {
        title: 'Admin Login',
        error: 'Correo o contraseña incorrectos',
        correo
      });
    }

    // Establecer sesión
    req.session.usuario = usuario;
    req.session.isLoggedIn = true;

    res.redirect('/views/panel');
  } catch (error) {
    console.error(error);
    res.render('login', {
      title: 'Admin Login',
      error: 'Ocurrió un error al iniciar sesión',
      correo
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('login');
  });
};
