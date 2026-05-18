const { body, param } = require('express-validator');

const submitAnswersValidator = [
  body('examId')
    .notEmpty().withMessage('examId es requerido')
    .isMongoId().withMessage('examId debe ser un ObjectId válido'),
  body('answers')
    .isArray({ min: 1 }).withMessage('answers debe ser un arreglo con al menos una respuesta'),
  body('answers.*.questionId')
    .notEmpty().withMessage('Cada respuesta debe incluir questionId')
    .isMongoId().withMessage('questionId debe ser un ObjectId válido'),
  body('answers.*.selectedOptions')
    .isArray().withMessage('selectedOptions debe ser un arreglo'),
  body('answers.*.selectedOptions.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 }).withMessage('Cada opción seleccionada debe tener texto válido'),
  body('timeTaken')
    .optional()
    .isInt({ min: 0 }).withMessage('timeTaken debe ser un número entero mayor o igual a 0')
    .toInt(),
];

const examIdParamValidator = [
  param('examId').isMongoId().withMessage('El id del examen no es válido'),
];

module.exports = { submitAnswersValidator, examIdParamValidator };
