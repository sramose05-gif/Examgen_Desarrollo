const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validateRequest');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// POST /api/auth/register
router.post('/register', registerValidator, validateRequest, ctrl.register);

// POST /api/auth/login
router.post('/login', loginValidator, validateRequest, ctrl.login);

// GET /api/auth/me  (protegida)
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
