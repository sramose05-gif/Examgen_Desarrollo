const questionService = require('../services/question.service');

const questionController = {

  // GET /api/questions
  async getAll(req, res) {
    try {
      const { page, limit, category, difficulty, tags, mine } = req.query;
      const ownerId = mine === 'true' ? req.user._id : undefined;
      const data = await questionService.getAll({ page, limit, category, difficulty, tags, ownerId });
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/questions/:id
  async getById(req, res) {
    try {
      const data = await questionService.getById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // POST /api/questions
  async create(req, res) {
    try {
      const { statement, type, options, correctAnswer, category, difficulty, tags } = req.body;
      if (!statement || !options || !correctAnswer)
        return res.status(400).json({ success: false, error: 'statement, options y correctAnswer son requeridos', code: 'MISSING_FIELDS' });
      if (!Array.isArray(options) || options.length < 2)
        return res.status(400).json({ success: false, error: 'options debe ser un array con al menos 2 elementos', code: 'INVALID_OPTIONS' });
      if (!Array.isArray(correctAnswer) || correctAnswer.length < 1)
        return res.status(400).json({ success: false, error: 'correctAnswer debe ser un array con al menos 1 elemento', code: 'INVALID_ANSWER' });

      const data = await questionService.create({ statement, type, options, correctAnswer, category, difficulty, tags }, req.user._id);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // PATCH /api/questions/:id
  async update(req, res) {
    try {
      const data = await questionService.update(req.params.id, req.body, req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // DELETE /api/questions/:id
  async delete(req, res) {
    try {
      await questionService.delete(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: { message: 'Pregunta eliminada correctamente' } });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },
};

module.exports = questionController;
