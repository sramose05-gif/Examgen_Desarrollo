const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 80 }).withMessage('El nombre debe tener entre 2 y 80 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo debe tener un formato válido')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('La contraseña debe ser texto')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('role')
    .optional()
    .isIn(['teacher', 'student']).withMessage('El rol debe ser teacher o student'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo debe tener un formato válido')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('La contraseña debe ser texto')
    .notEmpty().withMessage('La contraseña es requerida'),
];

module.exports = { registerValidator, loginValidator };
