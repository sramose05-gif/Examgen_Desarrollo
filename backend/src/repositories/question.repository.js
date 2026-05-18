const Question = require('../models/Question');

// Toda interacción directa con MongoDB va aquí (Isaac)
const questionRepository = {

  async create(data) {
    return Question.create(data);
  },

  async findById(id) {
    return Question.findById(id).populate('ownerId', 'name email');
  },

  // Filtros: category, difficulty, tags, ownerId + paginación
  async getAll({ page = 1, limit = 10, category, difficulty, tags, ownerId } = {}) {
    const filter = {};
    if (ownerId)    filter.ownerId    = ownerId;
    if (category)   filter.category   = new RegExp(category, 'i');
    if (difficulty) filter.difficulty = Number(difficulty);
    if (tags)       filter.tags       = { $in: tags.split(',').map(t => t.trim()) };

    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(filter).populate('ownerId', 'name').skip(skip).limit(Number(limit)),
      Question.countDocuments(filter),
    ]);
    return { questions, total, page: Number(page), pages: Math.ceil(total / limit) };
  },

  async update(id, data) {
    return Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async delete(id) {
    const q = await Question.findById(id);
    if (q) await q.deleteOne();
  },
};

module.exports = questionRepository;
