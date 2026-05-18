const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── VERIFICAR TOKEN ───────────────────────────────────────────────────────────
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado', code: 'NO_TOKEN' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, error: 'Token inválido', code: 'INVALID_TOKEN' });
  }
};

// ── VERIFICAR ROL ─────────────────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'No autenticado', code: 'NOT_AUTH' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error:   `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`,
      code:    'FORBIDDEN',
    });
  }
  next();
};

module.exports = { requireAuth, requireRole };
