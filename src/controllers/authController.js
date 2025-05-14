const User = require('../models/user');

const authController = {
  // Renderizar la página de login
  loginPage: (req, res) => {
    console.log('🟡 Renderizando loginPage');
    console.log('🔍 Usuario en req.user:', req.user);
    console.log('🔍 Session ID:', req.sessionID);
    
    res.render('auth/login', {
      title: 'TruchaShop | Login Administrador',
      user: req.user
    });
  },
  
  // Manejar logout
  logout: (req, res) => {
    console.log('🚪 Logout solicitado por el usuario');
    if (req.user) {
      console.log('👋 Cerrando sesión para:', req.user.email);
    }
    
    req.logout(function(err) {
      if (err) {
        console.error('❌ Error durante logout:', err);
        return res.status(500).send('Error al cerrar sesión');
      }
      console.log('✅ Logout exitoso. Cerrando sesión...');
      
      // Destruir la sesión completamente
      req.session.destroy(() => {
        console.log('🗑️ Sesión destruida');
        res.redirect('/');
      });
    });
  },
  
  // Dashboard del administrador
  dashboard: async (req, res) => {
    console.log('📊 Acceso al dashboard');
    console.log('👤 Usuario autenticado:', req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : 'No autenticado');
    
    try {
      // Aquí podrías cargar más datos si lo necesitas
      res.render('admin/dashboard', {
        title: 'Panel de Administración | TruchaShop',
        user: req.user
      });
    } catch (error) {
      console.error('❌ Error en dashboard:', error);
      res.status(500).render('error', {
        message: 'Error al cargar el panel de administración',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
};

module.exports = authController;