const examRepo   = require('../repositories/exam.repository');
const resultRepo = require('../repositories/result.repository');

const examService = {

  async create(data, teacherId) {
    return examRepo.create({ ...data, ownerId: teacherId });
  },

  async getAll(filters) {
    return examRepo.getAll(filters);
  },

  async getById(id) {
    const exam = await examRepo.findById(id);
    if (!exam) throw { status: 404, message: 'Examen no encontrado', code: 'NOT_FOUND' };
    return exam;
  },

  async getByCode(code) {
    const exam = await examRepo.findByCode(code);
    if (!exam) throw { status: 404, message: 'Código incorrecto o examen no disponible', code: 'EXAM_NOT_FOUND' };
    return exam;
  },

  async update(id, data, teacherId) {
    const exam = await examRepo.findById(id);
    if (!exam) throw { status: 404, message: 'Examen no encontrado', code: 'NOT_FOUND' };
    if (String(exam.ownerId._id) !== String(teacherId))
      throw { status: 403, message: 'No tienes permiso para editar este examen', code: 'FORBIDDEN' };
    return examRepo.update(id, data);
  },

  async delete(id, teacherId) {
    const exam = await examRepo.findById(id);
    if (!exam) throw { status: 404, message: 'Examen no encontrado', code: 'NOT_FOUND' };
    if (String(exam.ownerId._id) !== String(teacherId))
      throw { status: 403, message: 'No tienes permiso para eliminar este examen', code: 'FORBIDDEN' };
    return examRepo.delete(id);
  },

  // Alumno entra al examen con código
  async joinByCode(code, student) {
    const exam = await examRepo.findByCode(code);
    if (!exam) throw { status: 404, message: 'Código incorrecto o examen no disponible', code: 'EXAM_NOT_FOUND' };

    // Verificar si ya entregó
    const prevResult = await resultRepo.findByStudentAndExam(student._id, exam._id);
    if (prevResult) throw { status: 409, message: 'Ya completaste este examen', code: 'ALREADY_SUBMITTED' };

    // Registrar entrada si no estaba ya
    const already = exam.activeStudents.find(s => String(s.studentId) === String(student._id));
    if (!already) {
      await examRepo.addStudent(exam._id, {
        studentId:   student._id,
        studentName: student.name,
        startedAt:   new Date(),
      });
    }
    return exam;
  },

  // Profesor ve los alumnos activos
  async getStudents(examId, teacherId) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw { status: 404, message: 'Examen no encontrado', code: 'NOT_FOUND' };
    if (String(exam.ownerId._id) !== String(teacherId))
      throw { status: 403, message: 'Acceso denegado', code: 'FORBIDDEN' };
    const results = await resultRepo.getByExam(examId);
    return { activeStudents: exam.activeStudents, results };
  },
};

module.exports = examService;
