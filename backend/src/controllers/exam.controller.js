const examService = require('../services/exam.service');

const examController = {

  // GET /api/exams
  async getAll(req, res) {
    try {
      const { page, limit, status, mine } = req.query;
      const ownerId = mine === 'true' ? req.user._id : undefined;
      const data = await examService.getAll({ page, limit, status, ownerId });
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/exams/:id
  async getById(req, res) {
    try {
      const data = await examService.getById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/exams/code/:code
  async getByCode(req, res) {
    try {
      const data = await examService.getByCode(req.params.code);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // POST /api/exams
  async create(req, res) {
    try {
      const { title, description, questionIds, timeLimitMin, status } = req.body;
      if (!title)
        return res.status(400).json({ success: false, error: 'El título es requerido', code: 'MISSING_FIELDS' });
      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0)
        return res.status(400).json({ success: false, error: 'Debes agregar al menos una pregunta', code: 'NO_QUESTIONS' });

      const data = await examService.create({ title, description, questionIds, timeLimitMin, status }, req.user._id);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // PATCH /api/exams/:id
  async update(req, res) {
    try {
      const data = await examService.update(req.params.id, req.body, req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // DELETE /api/exams/:id
  async delete(req, res) {
    try {
      await examService.delete(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: { message: 'Examen eliminado correctamente' } });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // POST /api/exams/join/:code  (alumno entra con código)
  async join(req, res) {
    try {
      const data = await examService.joinByCode(req.params.code, req.user);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/exams/:id/students  (profesor ve sus alumnos)
  async getStudents(req, res) {
    try {
      const data = await examService.getStudents(req.params.id, req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },
};

module.exports = examController;
