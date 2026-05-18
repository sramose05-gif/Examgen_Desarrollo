const { body, param, query } = require('express-validator');

const listQuestionsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
  query('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('difficulty debe estar entre 1 y 5').toInt(),
  query('mine').optional().isBoolean().withMessage('mine debe ser true o false'),
  query('category').optional().trim().isLength({ max: 80 }).withMessage('category no debe superar 80 caracteres'),
  query('tags').optional().trim().isLength({ max: 200 }).withMessage('tags no debe superar 200 caracteres'),
];

const questionIdValidator = [
  param('id').isMongoId().withMessage('El id de la pregunta no es válido'),
];

const createQuestionValidator = [
  body('statement')
    .trim()
    .notEmpty().withMessage('El enunciado de la pregunta es requerido')
    .isLength({ min: 5, max: 1000 }).withMessage('El enunciado debe tener entre 5 y 1000 caracteres'),
  body('type')
    .optional()
    .isIn(['multiple_choice', 'combined']).withMessage('El tipo debe ser multiple_choice o combined'),
  body('options')
    .isArray({ min: 2 }).withMessage('options debe ser un arreglo con al menos 2 opciones'),
  body('options.*')
    .trim()
    .notEmpty().withMessage('Cada opción debe tener texto')
    .isLength({ max: 300 }).withMessage('Cada opción no debe superar 300 caracteres'),
  body('correctAnswer')
    .isArray({ min: 1 }).withMessage('correctAnswer debe ser un arreglo con al menos una respuesta')
    .custom((answers, { req }) => {
      if (!Array.isArray(req.body.options)) return true;
      const options = req.body.options.map(String);
      return answers.every(ans => options.includes(String(ans)));
    }).withMessage('correctAnswer debe contener únicamente opciones existentes'),
  body('correctAnswer.*')
    .trim()
    .notEmpty().withMessage('Cada respuesta correcta debe tener texto'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 80 }).withMessage('category no debe superar 80 caracteres'),
  body('difficulty')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('difficulty debe estar entre 1 y 5')
    .toInt(),
  body('tags')
    .optional()
    .isArray().withMessage('tags debe ser un arreglo'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 40 }).withMessage('Cada tag no debe superar 40 caracteres'),
];

const updateQuestionValidator = [
  ...questionIdValidator,
  body('statement')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 }).withMessage('El enunciado debe tener entre 5 y 1000 caracteres'),
  body('type')
    .optional()
    .isIn(['multiple_choice', 'combined']).withMessage('El tipo debe ser multiple_choice o combined'),
  body('options')
    .optional()
    .isArray({ min: 2 }).withMessage('options debe ser un arreglo con al menos 2 opciones'),
  body('options.*')
    .optional()
    .trim()
    .notEmpty().withMessage('Cada opción debe tener texto')
    .isLength({ max: 300 }).withMessage('Cada opción no debe superar 300 caracteres'),
  body('correctAnswer')
    .optional()
    .isArray({ min: 1 }).withMessage('correctAnswer debe ser un arreglo con al menos una respuesta')
    .custom((answers, { req }) => {
      if (!Array.isArray(req.body.options)) return true;
      const options = req.body.options.map(String);
      return answers.every(ans => options.includes(String(ans)));
    }).withMessage('correctAnswer debe contener únicamente opciones existentes'),
  body('difficulty')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('difficulty debe estar entre 1 y 5')
    .toInt(),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 80 }).withMessage('category no debe superar 80 caracteres'),
  body('tags')
    .optional()
    .isArray().withMessage('tags debe ser un arreglo'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 40 }).withMessage('Cada tag no debe superar 40 caracteres'),
];

module.exports = {
  listQuestionsValidator,
  questionIdValidator,
  createQuestionValidator,
  updateQuestionValidator,
};
