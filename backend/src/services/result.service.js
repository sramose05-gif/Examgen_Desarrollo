const resultRepo = require('../repositories/result.repository');
const examRepo   = require('../repositories/exam.repository');
const Question   = require('../models/Question');

const resultService = {

  async submit({ examId, studentId, answers, timeTaken }) {
    // Verificar que no haya entregado ya
    const prev = await resultRepo.findByStudentAndExam(studentId, examId);
    if (prev) throw { status: 409, message: 'Ya enviaste este examen', code: 'ALREADY_SUBMITTED' };

    // Cargar preguntas del examen
    const exam = await examRepo.findById(examId);
    if (!exam) throw { status: 404, message: 'Examen no encontrado', code: 'NOT_FOUND' };

    const questions = exam.questionIds; // ya vienen populadas
    let correct = 0;

    const breakdown = questions.map(q => {
      const studentAnswer = answers.find(a => String(a.questionId) === String(q._id));
      const selected      = studentAnswer ? studentAnswer.selectedOptions : [];
      const correctSorted = [...q.correctAnswer].sort();
      const selectedSorted = [...selected].sort();
      const isCorrect     = JSON.stringify(correctSorted) === JSON.stringify(selectedSorted);
      if (isCorrect) correct++;
      return {
        questionId:      q._id,
        questionText:    q.statement,
        selectedOptions: selected,
        correctAnswer:   q.correctAnswer,
        isCorrect,
      };
    });

    const score  = Math.round((correct / questions.length) * 100);
    const result = await resultRepo.create({ examId, studentId, score, correct, total: questions.length, breakdown, timeTaken: timeTaken || 0 });

    // Marcar como entregado en el examen
    await examRepo.markSubmitted(examId, studentId);

    return result;
  },

  async getByExam(examId) {
    return resultRepo.getByExam(examId);
  },

  async getByStudent(studentId) {
    return resultRepo.getByStudent(studentId);
  },

  async getOne(studentId, examId) {
    const r = await resultRepo.findByStudentAndExam(studentId, examId);
    if (!r) throw { status: 404, message: 'Resultado no encontrado', code: 'NOT_FOUND' };
    return r;
  },
};

module.exports = resultService;
