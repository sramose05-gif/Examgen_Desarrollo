require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── MIDDLEWARES GLOBALES ───────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// ── SWAGGER ───────────────────────────────────────────────────────────────────
try {
  const { swaggerUi, swaggerDoc } = require('./config/swagger');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  console.log('📄 Swagger disponible en /api/docs');
} catch (e) {
  console.warn('⚠️  swagger.yaml no encontrado — /api/docs no disponible');
}

// ── RUTAS ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/users',     require('./routes/user.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/exams',     require('./routes/exam.routes'));
app.use('/api/answers',   require('./routes/result.routes'));

// ── RUTA BASE ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.json({ success: true, message: 'ExamGen API corriendo 🚀', version: '1.0.0' })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, error: 'Ruta no encontrada', code: 'NOT_FOUND' })
);

// ── ERROR GLOBAL ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor', code: 'SERVER_ERROR' });
});

// ── INICIAR ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
});
