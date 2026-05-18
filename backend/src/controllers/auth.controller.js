const authService = require('../services/auth.service');

const authController = {

  // POST /api/auth/register
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ success: false, error: 'name, email y password son requeridos', code: 'MISSING_FIELDS' });
      if (password.length < 8)
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres', code: 'WEAK_PASSWORD' });

      const data = await authService.register({ name, email, password, role });
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ success: false, error: 'email y password son requeridos', code: 'MISSING_FIELDS' });

      const data = await authService.login({ email, password });
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/auth/me
  async me(req, res) {
    res.status(200).json({
      success: true,
      data: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
    });
  },
};

module.exports = authController;
