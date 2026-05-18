const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── ESQUEMA ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'El nombre es requerido'], trim: true,
  },
  email: {
    type: String, required: [true, 'El correo es requerido'],
    unique: true, lowercase: true, trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de correo inválido'],
  },
  password: {
    type: String, required: [true, 'La contraseña es requerida'], minlength: 8, select: false,
  },
  role: {
    type: String, enum: ['teacher', 'student'], default: 'student',
  },
}, { timestamps: true });

// ── HOOK: encriptar contraseña antes de guardar (Paulo) ──────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── MÉTODO: comparar contraseña ───────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
