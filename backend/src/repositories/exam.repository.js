const Exam = require('../models/Exam');

// Toda interacción directa con MongoDB va aquí (Sebastián)
const examRepository = {

  async create(data) {
    return Exam.create(data);
  },

  async findById(id) {
    return Exam.findById(id)
      .populate('ownerId',     'name email')
      .populate('questionIds', 'statement options correctAnswer type category difficulty');
  },

  async findByCode(code) {
    return Exam.findOne({ code: code.toUpperCase(), status: 'published' })
      .populate('questionIds', 'statement options type category difficulty');
  },

  // Filtros: status, ownerId + paginación
  async getAll({ page = 1, limit = 10, status, ownerId } = {}) {
    const filter = {};
    if (ownerId) filter.ownerId = ownerId;
    if (status)  filter.status  = status;

    const skip = (page - 1) * limit;
    const [exams, total] = await Promise.all([
      Exam.find(filter).populate('ownerId', 'name').skip(skip).limit(Number(limit)),
      Exam.countDocuments(filter),
    ]);
    return { exams, total, page: Number(page), pages: Math.ceil(total / limit) };
  },

  async update(id, data) {
    return Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async delete(id) {
    return Exam.findByIdAndDelete(id);
  },

  async addStudent(examId, studentData) {
    return Exam.findByIdAndUpdate(
      examId,
      { $push: { activeStudents: studentData } },
      { new: true }
    );
  },

  async markSubmitted(examId, studentId) {
    return Exam.findOneAndUpdate(
      { _id: examId, 'activeStudents.studentId': studentId },
      { $set: { 'activeStudents.$.submitted': true, 'activeStudents.$.submittedAt': new Date() } },
      { new: true }
    );
  },
};

module.exports = examRepository;
