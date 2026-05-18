const router = require('express').Router();
const ctrl = require('../controllers/result.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validateRequest');
const { submitAnswersValidator, examIdParamValidator } = require('../validators/result.validator');

// POST /api/answers — alumno envía examen
router.post('/', requireAuth, requireRole('student'), submitAnswersValidator, validateRequest, ctrl.submit);

// GET /api/answers/me — alumno ve sus resultados
router.get('/me', requireAuth, requireRole('student'), ctrl.getMine);

// GET /api/answers/me/:examId — alumno ve resultado específico
router.get('/me/:examId', requireAuth, requireRole('student'), examIdParamValidator, validateRequest, ctrl.getOne);

// GET /api/answers/exam/:examId — profesor ve resultados de su examen
router.get('/exam/:examId', requireAuth, requireRole('teacher'), examIdParamValidator, validateRequest, ctrl.getByExam);

module.exports = router;
