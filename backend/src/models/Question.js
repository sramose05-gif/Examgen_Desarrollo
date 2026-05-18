const mongoose = require('mongoose');

// ── ESQUEMA ──────────────────────────────────────────────────────────────────
// Relación REFERENCIADA con User (ownerId) porque un usuario existe
// de forma independiente y puede tener muchas preguntas.
const questionSchema = new mongoose.Schema({
  statement: {
    type: String, required: [true, 'El enunciado es requerido'], trim: true,
  },
  type: {
    type: String, enum: ['multiple_choice', 'combined'], default: 'multiple_choice',
  },
  // EMBEDDED: las opciones son propias de la pregunta, no existen sin ella
  options: {
    type: [String],
    validate: {
      validator: v => v.length >= 2,
      message:   'Debe haber al menos 2 opciones',
    },
  },
  correctAnswer: {
    type: [String],
    required: [true, 'La respuesta correcta es requerida'],
    validate: {
      validator: function (v) {
        return v.length >= 1 && v.every(ans => this.options.includes(ans));
      },
      message: 'correctAnswer debe contener solo valores que existan en options',
    },
  },
  category:   { type: String, default: 'General', trim: true },
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  tags:       { type: [String], default: [] },
  // Referencia al profesor dueño de la pregunta
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Índices para filtrado rápido (Isaac)
questionSchema.index({ ownerId: 1 });
questionSchema.index({ category: 1, difficulty: 1 });

// ── HOOK: log de eliminación ──────────────────────────────────────────────────
questionSchema.pre('deleteOne', { document: true }, function (next) {
  console.log(`🗑 Pregunta eliminada: ${this._id}`);
  next();
});

module.exports = mongoose.model('Question', questionSchema);
