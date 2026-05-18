const Result = require('../models/Result');

const resultRepository = {

  async create(data) {
    return Result.create(data);
  },

  async findByStudentAndExam(studentId, examId) {
    return Result.findOne({ studentId, examId })
      .populate('examId',    'title')
      .populate('studentId', 'name email');
  },

  async getByExam(examId) {
    return Result.find({ examId })
      .populate('studentId', 'name email')
      .sort({ score: -1 });
  },

  async getByStudent(studentId) {
    return Result.find({ studentId })
      .populate('examId', 'title timeLimitMin')
      .sort({ createdAt: -1 });
  },
};

module.exports = resultRepository;
