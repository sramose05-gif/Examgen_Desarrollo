const router = require('express').Router();
const ctrl = require('../controllers/exam.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  listExamsValidator,
  examIdValidator,
  examCodeValidator,
  createExamValidator,
  updateExamValidator,
} = require('../validators/exam.validator');

// GET /api/exams
router.get('/', requireAuth, listExamsValidator, validateRequest, ctrl.getAll);

// GET /api/exams/code/:code — alumno busca por código
router.get('/code/:code', requireAuth, examCodeValidator, validateRequest, ctrl.getByCode);

// POST /api/exams/join/:code — alumno entra con código
router.post('/join/:code', requireAuth, requireRole('student'), examCodeValidator, validateRequest, ctrl.join);

// GET /api/exams/:id/students — profesor ve alumnos activos y resultados
router.get('/:id/students', requireAuth, requireRole('teacher'), examIdValidator, validateRequest, ctrl.getStudents);

// GET /api/exams/:id
router.get('/:id', requireAuth, examIdValidator, validateRequest, ctrl.getById);

// POST /api/exams — solo profesores
router.post('/', requireAuth, requireRole('teacher'), createExamValidator, validateRequest, ctrl.create);

// PATCH /api/exams/:id — solo el profesor dueño
router.patch('/:id', requireAuth, requireRole('teacher'), updateExamValidator, validateRequest, ctrl.update);

// DELETE /api/exams/:id — solo el profesor dueño
router.delete('/:id', requireAuth, requireRole('teacher'), examIdValidator, validateRequest, ctrl.delete);

module.exports = router;
