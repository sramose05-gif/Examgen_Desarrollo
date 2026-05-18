const router = require('express').Router();
const ctrl = require('../controllers/question.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  listQuestionsValidator,
  questionIdValidator,
  createQuestionValidator,
  updateQuestionValidator,
} = require('../validators/question.validator');

// GET /api/questions
router.get('/', requireAuth, listQuestionsValidator, validateRequest, ctrl.getAll);

// GET /api/questions/:id
router.get('/:id', requireAuth, questionIdValidator, validateRequest, ctrl.getById);

// POST /api/questions — solo profesores
router.post('/', requireAuth, requireRole('teacher'), createQuestionValidator, validateRequest, ctrl.create);

// PATCH /api/questions/:id — solo el profesor dueño
router.patch('/:id', requireAuth, requireRole('teacher'), updateQuestionValidator, validateRequest, ctrl.update);

// DELETE /api/questions/:id — solo el profesor dueño
router.delete('/:id', requireAuth, requireRole('teacher'), questionIdValidator, validateRequest, ctrl.delete);

module.exports = router;
