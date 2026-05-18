const mongoose = require('mongoose');

// ── ESQUEMA ──────────────────────────────────────────────────────────────────
// Relación REFERENCIADA con Question (questionIds) porque las preguntas
// existen de forma independiente y se comparten entre exámenes.
// Relación REFERENCIADA con User (ownerId) por la misma razón.
//
// activeStudents: EMBEDDED porque son datos operativos del examen
// (quién está respondiendo ahora), su tamaño es acotado y no se
// consultan de forma independiente fuera del examen.
const examSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'El título es requerido'], trim: true },
  description: { type: String, default: '', trim: true },
  code: {
    type: String, unique: true, uppercase: true,
    match: [/^[A-Z0-9]{6}$/, 'El código debe tener 6 caracteres alfanuméricos'],
  },
  status: {
    type: String, enum: ['draft', 'published', 'closed'], default: 'draft',
  },
  timeLimitMin: { type: Number, min: 1, default: 45 },
  // Referencias a preguntas (Sebastián)
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  // Referencia al profesor
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Documentos embebidos: alumnos activos en el examen
  activeStudents: [{
    studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    startedAt:   { type: Date, default: Date.now },
    submitted:   { type: Boolean, default: false },
    submittedAt: { type: Date },
  }],
}, { timestamps: true });

// Índices
examSchema.index({ ownerId: 1 });
examSchema.index({ code: 1 });

// ── HOOK: generar código único antes de guardar ───────────────────────────────
examSchema.pre('save', async function (next) {
  if (!this.isNew || this.code) return next();
  let unique = false;
  while (!unique) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const exists = await mongoose.model('Exam').findOne({ code });
    if (!exists) { this.code = code; unique = true; }
  }
  next();
});

module.exports = mongoose.model('Exam', examSchema);
