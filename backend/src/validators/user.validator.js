const { query } = require('express-validator');

const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100').toInt(),
  query('role').optional().isIn(['teacher', 'student']).withMessage('role debe ser teacher o student'),
];

module.exports = { listUsersValidator };
