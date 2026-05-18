const questionRepo = require('../repositories/question.repository');

const questionService = {

  async create(data, teacherId) {
    return questionRepo.create({ ...data, ownerId: teacherId });
  },

  async getAll(filters) {
    return questionRepo.getAll(filters);
  },

  async getById(id) {
    const q = await questionRepo.findById(id);
    if (!q) throw { status: 404, message: 'Pregunta no encontrada', code: 'NOT_FOUND' };
    return q;
  },

  async update(id, data, teacherId) {
    const q = await questionRepo.findById(id);
    if (!q) throw { status: 404, message: 'Pregunta no encontrada', code: 'NOT_FOUND' };
    if (String(q.ownerId._id) !== String(teacherId))
      throw { status: 403, message: 'No tienes permiso para editar esta pregunta', code: 'FORBIDDEN' };
    return questionRepo.update(id, data);
  },

  async delete(id, teacherId) {
    const q = await questionRepo.findById(id);
    if (!q) throw { status: 404, message: 'Pregunta no encontrada', code: 'NOT_FOUND' };
    if (String(q.ownerId._id) !== String(teacherId))
      throw { status: 403, message: 'No tienes permiso para eliminar esta pregunta', code: 'FORBIDDEN' };
    await questionRepo.delete(id);
  },
};

module.exports = questionService;
