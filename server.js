const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ruta principal
app.get('/', (req, res) => {
    res.render('index'); // No es necesario el .ejs
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
    console.warn(`⚠️ Ruta no encontrada: ${req.url}`);
    res.status(404).send('Página no encontrada');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
