const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  // Validar variables de entorno
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ ERROR CRÍTICO: Faltan las variables de entorno para Google OAuth.');
    console.error('Por favor, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en tu archivo .env');
    return;
  } else {
    console.log('✅ Variables de entorno para Google OAuth cargadas correctamente.');
  }

  // Serializar usuario para la sesión - PUNTO CRÍTICO
  passport.serializeUser((user, done) => {
    console.log('🔐 Serializando usuario con ID:', user.id);
    // Almacena SOLO el ID del usuario en la sesión
    done(null, user.id);
  });

  // Deserializar usuario desde la sesión - PUNTO CRÍTICO
  passport.deserializeUser(async (id, done) => {
    console.log('🧠 Deserializando usuario con ID:', id);
    try {
      const user = await User.findById(id);
      if (user) {
        console.log('✅ Usuario encontrado en DB:', user.email);
        // Retorna el objeto usuario completo
        done(null, user);
      } else {
        console.log('⚠️ Usuario no encontrado en DB durante deserialización.');
        done(null, false);
      }
    } catch (error) {
      console.error('❌ Error al deserializar usuario:', error);
      done(error, null);
    }
  });

  // Determinar entorno para callback URL
  const isProduction = process.env.NODE_ENV === 'production';
  const callbackURL = isProduction
    ? 'https://web-truchashop.onrender.com/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback';
  
  console.log(`🌐 Entorno detectado: ${isProduction ? 'Producción' : 'Desarrollo'}`);
  console.log(`📍 callbackURL configurado: ${callbackURL}`);

  // Configurar estrategia Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL, // Usar la URL determinada por el entorno
        scope: ['profile', 'email'],
        proxy: true // Importante para Render/Heroku
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('🔓 Callback de Google ejecutado');
        try {
          console.log('📦 Perfil de Google recibido:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName
          });

          // Verificar si el usuario ya existe en la DB por Google ID
          let user = await User.findOne({ googleId: profile.id });
          
          // Si no lo encuentra por Google ID, intentar por email
          if (!user && profile.emails?.[0]?.value) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user && !user.googleId) {
              // Si encuentra el usuario por email pero no tiene googleId, actualizar
              console.log('🔄 Usuario encontrado por email. Actualizando googleId...');
              user.googleId = profile.id;
            }
          }

          if (user) {
            console.log('👤 Usuario ya existe. Actualizando fecha de último login...');
            user.lastLogin = Date.now();
            await user.save();
            console.log('✅ Usuario actualizado y autenticado:', user.email);
            return done(null, user);
          }

          // Si no existe, no crear un nuevo usuario, solo rechazar el acceso
          console.log('⚠️ Usuario no encontrado. Acceso denegado. Solicita autorización.');
          return done(null, false, { message: 'Acceso denegado. Solicita autorización para acceder.' });

        } catch (error) {
          console.error('❌ Error en autenticación de Google:', error);
          return done(error, null);
        }
      }
    )
  );
};
