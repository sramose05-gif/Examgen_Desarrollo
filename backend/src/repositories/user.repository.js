const User = require('../models/User');

// Toda interacción directa con MongoDB va aquí (Paulo)
const userRepository = {

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  },

  async findById(id) {
    return User.findById(id);
  },

  async create(data) {
    return User.create(data);
  },

  async getAll({ page = 1, limit = 10, role } = {}) {
    const filter = role ? { role } : {};
    const skip   = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).select('-password'),
      User.countDocuments(filter),
    ]);
    return { users, total, page: Number(page), pages: Math.ceil(total / limit) };
  },
};

module.exports = userRepository;
