const jwt      = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const authService = {

  // ── REGISTRO ─────────────────────────────────────────────────────────────
  async register({ name, email, password, role }) {
    // Verificar correo duplicado
    const existing = await userRepo.findByEmail(email);
    if (existing) throw { status: 400, message: 'El correo ya está registrado', code: 'EMAIL_TAKEN' };

    const user  = await userRepo.create({ name, email, password, role });
    const token = signToken(user._id);

    return {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    };
  },

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw { status: 401, message: 'Correo no registrado', code: 'INVALID_CREDENTIALS' };

    const match = await user.comparePassword(password);
    if (!match) throw { status: 401, message: 'Contraseña incorrecta', code: 'INVALID_CREDENTIALS' };

    const token = signToken(user._id);
    return {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    };
  },
};

module.exports = authService;
