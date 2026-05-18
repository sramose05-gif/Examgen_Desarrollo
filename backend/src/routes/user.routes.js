const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validateRequest');
const { listUsersValidator } = require('../validators/user.validator');
const userRepo = require('../repositories/user.repository');

// GET /api/users — solo profesores pueden ver la lista de usuarios
router.get('/', requireAuth, requireRole('teacher'), listUsersValidator, validateRequest, async (req, res) => {
  try {
    const { page, limit, role } = req.query;
    const data = await userRepo.getAll({ page, limit, role });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'SERVER_ERROR' });
  }
});

module.exports = router;
