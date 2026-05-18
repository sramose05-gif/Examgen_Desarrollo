const mongoose = require('mongoose');

// ── ESQUEMA ──────────────────────────────────────────────────────────────────
// breakdown: EMBEDDED porque es el detalle de las respuestas de UN intento
// específico. No se consulta de forma independiente y es propio del resultado.
// Referencias a Exam y User son REFERENCIADAS porque existen de forma independiente.
const resultSchema = new mongoose.Schema({
  examId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Exam',    required: true },
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  score:       { type: Number, min: 0, max: 100, required: true },
  correct:     { type: Number, required: true },
  total:       { type: Number, required: true },
  timeTaken:   { type: Number, default: 0 }, // segundos
  // Documentos embebidos: desglose de cada respuesta
  breakdown: [{
    questionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionText:  { type: String },
    selectedOptions: [String],
    correctAnswer:   [String],
    isCorrect:     { type: Boolean },
  }],
}, { timestamps: true });

// Índice único: un alumno solo puede entregar un examen una vez
resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// ── HOOK: log al guardar resultado ────────────────────────────────────────────
resultSchema.post('save', function (doc) {
  console.log(`📊 Resultado guardado — Alumno: ${doc.studentId} | Examen: ${doc.examId} | Score: ${doc.score}%`);
});

module.exports = mongoose.model('Result', resultSchema);
