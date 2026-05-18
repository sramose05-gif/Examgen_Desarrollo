const { body, param, query } = require('express-validator');

const allowedStatus = ['draft', 'published', 'closed'];

const listExamsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
  query('status').optional().isIn(allowedStatus).withMessage('status debe ser draft, published o closed'),
  query('mine').optional().isBoolean().withMessage('mine debe ser true o false'),
];

const examIdValidator = [
  param('id').isMongoId().withMessage('El id del examen no es válido'),
];

const examCodeValidator = [
  param('code')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 caracteres')
    .isAlphanumeric().withMessage('El código solo puede contener letras y números')
    .toUpperCase(),
];

const createExamValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título del examen es requerido')
    .isLength({ min: 3, max: 120 }).withMessage('El título debe tener entre 3 y 120 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción no debe superar 1000 caracteres'),
  body('questionIds')
    .isArray({ min: 1 }).withMessage('Debes agregar al menos una pregunta al examen'),
  body('questionIds.*')
    .isMongoId().withMessage('Cada pregunta debe tener un ObjectId válido'),
  body('timeLimitMin')
    .optional()
    .isInt({ min: 1, max: 240 }).withMessage('timeLimitMin debe estar entre 1 y 240 minutos')
    .toInt(),
  body('status')
    .optional()
    .isIn(allowedStatus).withMessage('status debe ser draft, published o closed'),
];

const updateExamValidator = [
  ...examIdValidator,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 }).withMessage('El título debe tener entre 3 y 120 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción no debe superar 1000 caracteres'),
  body('questionIds')
    .optional()
    .isArray({ min: 1 }).withMessage('questionIds debe contener al menos una pregunta'),
  body('questionIds.*')
    .optional()
    .isMongoId().withMessage('Cada pregunta debe tener un ObjectId válido'),
  body('timeLimitMin')
    .optional()
    .isInt({ min: 1, max: 240 }).withMessage('timeLimitMin debe estar entre 1 y 240 minutos')
    .toInt(),
  body('status')
    .optional()
    .isIn(allowedStatus).withMessage('status debe ser draft, published o closed'),
];

module.exports = {
  listExamsValidator,
  examIdValidator,
  examCodeValidator,
  createExamValidator,
  updateExamValidator,
};
