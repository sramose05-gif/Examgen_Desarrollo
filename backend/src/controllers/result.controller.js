const resultService = require('../services/result.service');

const resultController = {

  // POST /api/answers  — alumno envía el examen
  async submit(req, res) {
    try {
      const { examId, answers, timeTaken } = req.body;
      if (!examId || !Array.isArray(answers))
        return res.status(400).json({ success: false, error: 'examId y answers son requeridos', code: 'MISSING_FIELDS' });

      const data = await resultService.submit({ examId, studentId: req.user._id, answers, timeTaken });
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/answers/exam/:examId  — profesor ve resultados de un examen
  async getByExam(req, res) {
    try {
      const data = await resultService.getByExam(req.params.examId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/answers/me  — alumno ve sus propios resultados
  async getMine(req, res) {
    try {
      const data = await resultService.getByStudent(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },

  // GET /api/answers/me/:examId  — alumno ve su resultado de un examen específico
  async getOne(req, res) {
    try {
      const data = await resultService.getOne(req.user._id, req.params.examId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.code });
    }
  },
};

module.exports = resultController;
