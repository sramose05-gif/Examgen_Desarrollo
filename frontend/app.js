const DEFAULT_API_URL = 'https://examgen-desarrollo.onrender.com/api';
const state = {
  apiUrl: localStorage.getItem('examgen_api_url') || DEFAULT_API_URL,
  token: localStorage.getItem('examgen_token') || '',
  user: JSON.parse(localStorage.getItem('examgen_user') || 'null'),
  teacherQuestions: [],
  teacherExams: [],
  activeExam: null,
  activeResult: null,
  selectedAnswers: {},
  examStartedAt: null,
  roleForRegister: 'teacher',
  currentTab: 'resumen',
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (value = '') => String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function saveSession(data) {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('examgen_token', data.token);
  localStorage.setItem('examgen_user', JSON.stringify(data.user));
}

function clearSession() {
  state.token = '';
  state.user = null;
  state.activeExam = null;
  state.activeResult = null;
  state.selectedAnswers = {};
  localStorage.removeItem('examgen_token');
  localStorage.removeItem('examgen_user');
  location.hash = '#/login';
  render();
}

function setApiUrl(url) {
  state.apiUrl = (url || DEFAULT_API_URL).replace(/\/$/, '');
  localStorage.setItem('examgen_api_url', state.apiUrl);
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(`${state.apiUrl}${path}`, { ...options, headers });
  let json = null;
  try { json = await response.json(); } catch (_) { json = null; }
  if (!response.ok || (json && json.success === false)) {
    const message = json?.error || `Error HTTP ${response.status}`;
    const details = json?.details?.map(d => `${d.field}: ${d.message}`).join(' | ');
    const err = new Error(details ? `${message}. ${details}` : message);
    err.status = response.status;
    err.payload = json;
    throw err;
  }
  return json?.data ?? json;
}

function toast(title, message = '', type = 'ok') {
  const root = $('#toast-root');
  const node = document.createElement('div');
  node.className = `toast ${type === 'err' ? 'err' : 'ok'}`;
  node.innerHTML = `<b>${esc(title)}</b>${message ? `<span>${esc(message)}</span>` : ''}`;
  root.appendChild(node);
  setTimeout(() => node.remove(), 5000);
}

function nav() {
  const role = state.user?.role;
  return `
    <nav class="nav">
      <a href="#/" class="logo" aria-label="ExamGen"><span class="logo-mark">✦</span><span>Exam</span><span>Gen</span></a>
      <div class="nav-actions">
        ${state.user ? `<div class="user-pill"><span class="user-dot"></span>${esc(state.user.name)} · ${role === 'teacher' ? 'Docente' : 'Estudiante'}</div>` : ''}
        ${state.user?.role === 'teacher' ? `<a class="btn btn-ghost btn-sm" href="#/teacher">Panel docente</a>` : ''}
        ${state.user?.role === 'student' ? `<a class="btn btn-ghost btn-sm" href="#/student">Panel alumno</a>` : ''}
        ${state.user ? `<button class="btn btn-danger btn-sm" data-action="logout">Cerrar sesión</button>` : `<a class="btn btn-primary btn-sm" href="#/login">Iniciar sesión</a>`}
      </div>
    </nav>`;
}

function shell(content) {
  $('#app').innerHTML = `<div class="app-shell">${nav()}${content}</div>`;
  bindGlobalActions();
}

function bindGlobalActions() {
  $$('[data-action="logout"]').forEach(btn => btn.addEventListener('click', clearSession));
}

function landingView() {
  shell(`
    <main class="container hero">
      <section class="hero-card">
        <div class="kicker">Producto desplegable full-stack</div>
        <h1>Exámenes listos, sin caos de archivos.</h1>
        <p class="hero-copy">ExamGen permite que un docente cree preguntas, publique exámenes con código y revise resultados; el estudiante entra con ese código, responde y recibe su calificación.</p>
        <div class="hero-actions">
          <a href="#/login" class="btn btn-primary">Entrar a la app</a>
          <a href="#/register" class="btn btn-ghost">Crear cuenta</a>
        </div>
        <div class="feature-grid">
          <div class="feature"><b>Rol docente</b><small>Banco de preguntas, creación de exámenes y consulta de alumnos.</small></div>
          <div class="feature"><b>Rol estudiante</b><small>Entrada por código, resolución del examen y resultados.</small></div>
          <div class="feature"><b>API protegida</b><small>JWT y autorización por roles teacher/student.</small></div>
          <div class="feature"><b>Producción</b><small>Front-end estático conectado al back-end de Render.</small></div>
        </div>
      </section>
      <aside class="hero-side">
        <div class="card demo-flow">
          <h2>Flujo principal</h2>
          <div class="flow-step"><span class="flow-num">1</span><div><strong>Docente crea preguntas</strong>Se guardan en MongoDB mediante la API.</div></div>
          <div class="flow-step"><span class="flow-num">2</span><div><strong>Docente crea examen</strong>Selecciona preguntas y publica con código.</div></div>
          <div class="flow-step"><span class="flow-num">3</span><div><strong>Alumno se vincula</strong>Ingresa el código y queda registrado en el examen.</div></div>
          <div class="flow-step"><span class="flow-num">4</span><div><strong>Alumno contesta</strong>La API calcula puntaje y genera desglose.</div></div>
        </div>
        <div class="card">
          <h3>Conexión de API</h3>
          <p class="small">URL actual:</p>
          <form class="form" id="api-form">
            <input name="apiUrl" value="${esc(state.apiUrl)}" />
            <button class="btn btn-ghost" type="submit">Guardar URL de API</button>
          </form>
        </div>
      </aside>
    </main>`);
  $('#api-form').addEventListener('submit', (e) => {
    e.preventDefault();
    setApiUrl(new FormData(e.currentTarget).get('apiUrl'));
    toast('API actualizada', state.apiUrl);
  });
}

function authView(mode = 'login') {
  const isLogin = mode === 'login';
  shell(`
    <main class="container hero" style="min-height:auto; align-items:center;">
      <section class="hero-card">
        <div class="kicker">${isLogin ? 'Autenticación' : 'Registro de usuarios'}</div>
        <h1>${isLogin ? 'Bienvenido de nuevo.' : 'Crea tu cuenta.'}</h1>
        <p class="hero-copy">Usa credenciales de docente o estudiante para entrar al flujo correspondiente. El token JWT se guarda en el navegador para consumir rutas protegidas.</p>
      </section>
      <section class="card">
        <h2>${isLogin ? 'Iniciar sesión' : 'Registro'}</h2>
        <form id="auth-form" class="form">
          ${isLogin ? '' : `<label>Nombre completo<input name="name" required minlength="2" placeholder="Profesor Demo" /></label>`}
          <label>Correo electrónico<input name="email" type="email" required placeholder="profesor.demo@test.com" /></label>
          <label>Contraseña<input name="password" type="password" required minlength="8" placeholder="Mínimo 8 caracteres" /></label>
          ${isLogin ? '' : `
            <div>
              <label>Rol</label>
              <div class="role-select">
                <button type="button" class="role-card ${state.roleForRegister === 'teacher' ? 'active' : ''}" data-role="teacher">👨‍🏫<br>Docente</button>
                <button type="button" class="role-card ${state.roleForRegister === 'student' ? 'active' : ''}" data-role="student">🎓<br>Estudiante</button>
              </div>
            </div>`}
          <button class="btn btn-primary btn-wide" type="submit">${isLogin ? 'Entrar' : 'Crear cuenta'}</button>
        </form>
        <p class="small" style="margin-top:16px">${isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'} <a href="#/${isLogin ? 'register' : 'login'}" class="success">${isLogin ? 'Regístrate aquí' : 'Inicia sesión'}</a></p>
      </section>
    </main>`);

  $$('[data-role]').forEach(btn => btn.addEventListener('click', () => {
    state.roleForRegister = btn.dataset.role;
    authView('register');
  }));

  $('#auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget).entries());
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Enviando';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: state.roleForRegister };
      const data = await api(`/auth/${isLogin ? 'login' : 'register'}`, { method: 'POST', body: JSON.stringify(payload) });
      saveSession(data);
      toast(isLogin ? 'Sesión iniciada' : 'Cuenta creada', `Rol: ${data.user.role}`);
      location.hash = data.user.role === 'teacher' ? '#/teacher' : '#/student';
      render();
    } catch (err) {
      toast('No se pudo autenticar', err.message, 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = isLogin ? 'Entrar' : 'Crear cuenta';
    }
  });
}

function ensureRole(role) {
  if (!state.user) { location.hash = '#/login'; render(); return false; }
  if (state.user.role !== role) {
    location.hash = state.user.role === 'teacher' ? '#/teacher' : '#/student';
    render();
    return false;
  }
  return true;
}

async function loadTeacherData() {
  const [qData, eData] = await Promise.all([
    api('/questions?mine=true&limit=100'),
    api('/exams?mine=true&limit=100'),
  ]);
  state.teacherQuestions = qData.questions || [];
  state.teacherExams = eData.exams || [];
}

function teacherView() {
  if (!ensureRole('teacher')) return;
  shell(`
    <main class="container">
      <section class="page-head card" style="margin-bottom:18px">
        <div class="card-header">
          <div>
            <div class="kicker">Panel docente</div>
            <h2>Gestión de preguntas, exámenes y resultados</h2>
            <p>Esta vista consume rutas protegidas por JWT y rol <b>teacher</b>.</p>
          </div>
          <button class="btn btn-primary" id="refresh-teacher">Actualizar datos</button>
        </div>
      </section>
      <div class="grid grid-3" id="teacher-stats">
        <div class="stat"><strong>—</strong><span>Exámenes</span></div>
        <div class="stat"><strong>—</strong><span>Preguntas</span></div>
        <div class="stat"><strong>—</strong><span>Publicados</span></div>
      </div>
      <div class="tabs">
        ${['resumen','preguntas','examenes','resultados'].map(tab => `<button class="tab ${state.currentTab === tab ? 'active' : ''}" data-tab="${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('')}
      </div>
      <section id="teacher-content"></section>
    </main>
    <div id="modal" class="modal"></div>`);

  $$('[data-tab]').forEach(btn => btn.addEventListener('click', () => { state.currentTab = btn.dataset.tab; renderTeacherContent(); }));
  $('#refresh-teacher').addEventListener('click', async () => { await refreshTeacher(); toast('Datos actualizados'); });
  refreshTeacher();
}

async function refreshTeacher() {
  try {
    await loadTeacherData();
    renderTeacherContent();
    renderTeacherStats();
  } catch (err) {
    toast('Error al cargar panel docente', err.message, 'err');
  }
}

function renderTeacherStats() {
  const published = state.teacherExams.filter(e => e.status === 'published').length;
  $('#teacher-stats').innerHTML = `
    <div class="stat"><strong>${state.teacherExams.length}</strong><span>Exámenes creados</span></div>
    <div class="stat"><strong>${state.teacherQuestions.length}</strong><span>Preguntas en banco</span></div>
    <div class="stat"><strong>${published}</strong><span>Exámenes publicados</span></div>`;
}

function renderTeacherContent() {
  const root = $('#teacher-content');
  if (!root) return;
  if (state.currentTab === 'preguntas') return renderQuestionManager(root);
  if (state.currentTab === 'examenes') return renderExamManager(root);
  if (state.currentTab === 'resultados') return renderResultsManager(root);
  root.innerHTML = `
    <div class="grid grid-2">
      <div class="card">
        <h3>Arquitectura de la aplicación</h3>
        <p>Front-end estático en Render → API REST en Render → MongoDB Atlas. La sesión se maneja con JWT y las operaciones se autorizan por rol.</p>
        <div class="badges"><span class="badge">HTML/CSS/JS</span><span class="badge green">Express API</span><span class="badge yellow">MongoDB</span></div>
      </div>
      <div class="card">
        <h3>Demostración rápida para video</h3>
        <p>Primero crea 2 preguntas, luego crea un examen publicado, copia el código y entra con un usuario estudiante.</p>
        <button class="btn btn-danger" id="validation-demo">Probar validación fallida</button>
        <p class="help">Envía una pregunta incompleta para mostrar error 400 del back-end.</p>
      </div>
    </div>`;
  $('#validation-demo').addEventListener('click', async () => {
    try {
      await api('/questions', { method: 'POST', body: JSON.stringify({ statement: '', type: 'multiple_choice', options: ['A'], correctAnswer: [] }) });
    } catch (err) {
      toast(`Validación funcionando: ${err.status || 400}`, err.message, 'err');
    }
  });
}

function renderQuestionManager(root) {
  root.innerHTML = `
    <div class="grid grid-main">
      <section class="card">
        <h3>Crear pregunta</h3>
        <form id="question-form" class="form">
          <label>Enunciado<textarea name="statement" required minlength="5" placeholder="¿Cuál es la derivada de f(x) = x²?"></textarea></label>
          <div class="grid grid-2">
            <label>Tipo<select name="type"><option value="multiple_choice">Opción múltiple</option><option value="combined">Respuesta combinada</option></select></label>
            <label>Dificultad<select name="difficulty"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></label>
          </div>
          <label>Categoría<input name="category" value="Matemáticas" /></label>
          <label>Etiquetas<input name="tags" placeholder="derivadas, calculo" /></label>
          <div>
            <label>Opciones y respuesta correcta</label>
            <div id="options-box" class="grid"></div>
            <button class="btn btn-ghost btn-sm" type="button" id="add-option">+ Agregar opción</button>
          </div>
          <button class="btn btn-primary" type="submit">Guardar pregunta</button>
        </form>
      </section>
      <section class="card">
        <div class="card-header"><h3>Banco de preguntas</h3><span class="badge">${state.teacherQuestions.length} preguntas</span></div>
        <div class="list">${state.teacherQuestions.length ? state.teacherQuestions.map(questionItem).join('') : `<div class="empty">Todavía no hay preguntas. Crea la primera para construir un examen.</div>`}</div>
      </section>
    </div>`;
  createOptionRows(['', '', '', '']);
  $('#add-option').addEventListener('click', () => createOptionRows([...getOptionValues().map(o => o.text), '']));
  $('#question-form').addEventListener('submit', submitQuestionForm);
  $$('[data-delete-question]').forEach(btn => btn.addEventListener('click', () => deleteQuestion(btn.dataset.deleteQuestion)));
}

function createOptionRows(values) {
  const box = $('#options-box');
  box.innerHTML = values.map((value, i) => `
    <div class="option-row">
      <span class="option-letter">${letters[i] || i + 1}</span>
      <input name="option" value="${esc(value)}" placeholder="Opción ${letters[i] || i + 1}" required />
      <button class="option-check" type="button" data-correct-index="${i}" title="Marcar correcta">✓</button>
    </div>`).join('');
  $$('[data-correct-index]').forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('active')));
  if (!$$('[data-correct-index].active').length) $('[data-correct-index]')?.classList.add('active');
}

function getOptionValues() {
  const rows = $$('.option-row');
  return rows.map((row, i) => ({
    text: row.querySelector('input[name="option"]').value.trim(),
    correct: row.querySelector('[data-correct-index]').classList.contains('active'),
    index: i,
  })).filter(o => o.text);
}

async function submitQuestionForm(e) {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(e.currentTarget).entries());
  const options = getOptionValues();
  const correctAnswer = options.filter(o => o.correct).map(o => o.text);
  try {
    await api('/questions', {
      method: 'POST',
      body: JSON.stringify({
        statement: form.statement,
        type: form.type,
        options: options.map(o => o.text),
        correctAnswer,
        category: form.category || 'General',
        difficulty: Number(form.difficulty || 3),
        tags: (form.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      }),
    });
    toast('Pregunta creada', 'Ya está disponible para agregarla a un examen.');
    e.currentTarget.reset();
    await refreshTeacher();
  } catch (err) {
    toast('No se pudo crear la pregunta', err.message, 'err');
  }
}

function questionItem(q) {
  return `<article class="item">
    <div class="item-top">
      <div><div class="item-title">${esc(q.statement)}</div><div class="small muted">${esc(q.category || 'General')} · dificultad ${q.difficulty || 3}</div></div>
      <button class="btn btn-danger btn-sm" data-delete-question="${q._id}">Eliminar</button>
    </div>
    <div class="badges"><span class="badge">${q.type === 'combined' ? 'Respuesta combinada' : 'Opción múltiple'}</span>${(q.tags || []).map(t => `<span class="badge green">${esc(t)}</span>`).join('')}</div>
  </article>`;
}

async function deleteQuestion(id) {
  if (!confirm('¿Eliminar esta pregunta?')) return;
  try {
    await api(`/questions/${id}`, { method: 'DELETE' });
    toast('Pregunta eliminada');
    await refreshTeacher();
  } catch (err) {
    toast('No se pudo eliminar', err.message, 'err');
  }
}

function renderExamManager(root) {
  root.innerHTML = `
    <div class="grid grid-main">
      <section class="card">
        <h3>Crear examen</h3>
        <form id="exam-form" class="form">
          <label>Título<input name="title" required minlength="3" placeholder="Parcial 1 - Matemáticas" /></label>
          <label>Descripción<textarea name="description" placeholder="Examen para evaluar derivadas básicas."></textarea></label>
          <div class="grid grid-2">
            <label>Tiempo límite<input name="timeLimitMin" type="number" min="1" max="240" value="30" /></label>
            <label>Estado<select name="status"><option value="published">Publicado</option><option value="draft">Borrador</option></select></label>
          </div>
          <div>
            <label>Seleccionar preguntas</label>
            <div class="question-picker">${state.teacherQuestions.length ? state.teacherQuestions.map(q => `
              <label class="pick-item"><input type="checkbox" name="questionIds" value="${q._id}"><span><b>${esc(q.statement)}</b><br><span class="small muted">${esc(q.category || 'General')} · ${q.type}</span></span></label>`).join('') : `<div class="empty">Primero crea preguntas en el banco.</div>`}</div>
          </div>
          <button class="btn btn-primary" type="submit" ${state.teacherQuestions.length ? '' : 'disabled'}>Crear examen</button>
        </form>
      </section>
      <section class="card">
        <div class="card-header"><h3>Mis exámenes</h3><span class="badge">${state.teacherExams.length} registros</span></div>
        <div class="list">${state.teacherExams.length ? state.teacherExams.map(examItem).join('') : `<div class="empty">No hay exámenes todavía.</div>`}</div>
      </section>
    </div>`;
  $('#exam-form')?.addEventListener('submit', submitExamForm);
  $$('[data-delete-exam]').forEach(btn => btn.addEventListener('click', () => deleteExam(btn.dataset.deleteExam)));
  $$('[data-students-exam]').forEach(btn => btn.addEventListener('click', () => openStudentsModal(btn.dataset.studentsExam)));
  $$('[data-copy-code]').forEach(btn => btn.addEventListener('click', () => navigator.clipboard.writeText(btn.dataset.copyCode).then(() => toast('Código copiado', btn.dataset.copyCode))));
}

function examItem(e) {
  const qCount = Array.isArray(e.questionIds) ? e.questionIds.length : 0;
  return `<article class="item">
    <div class="item-top">
      <div><div class="item-title">${esc(e.title)}</div><div class="small muted">${esc(e.description || 'Sin descripción')}</div></div>
      <span class="badge ${e.status === 'published' ? 'green' : 'yellow'}">${esc(e.status)}</span>
    </div>
    <div class="badges"><span class="badge">${qCount} preguntas</span><span class="badge">${e.timeLimitMin || 30} min</span>${e.code ? `<span class="badge green">Código <span class="code">${esc(e.code)}</span></span>` : ''}</div>
    <div class="row" style="margin-top:12px">
      ${e.code ? `<button class="btn btn-good btn-sm" data-copy-code="${esc(e.code)}">Copiar código</button>` : ''}
      <button class="btn btn-ghost btn-sm" data-students-exam="${e._id}">Alumnos/resultados</button>
      <button class="btn btn-danger btn-sm" data-delete-exam="${e._id}">Eliminar</button>
    </div>
  </article>`;
}

async function submitExamForm(e) {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const questionIds = fd.getAll('questionIds');
  try {
    const exam = await api('/exams', {
      method: 'POST',
      body: JSON.stringify({
        title: fd.get('title'),
        description: fd.get('description'),
        questionIds,
        timeLimitMin: Number(fd.get('timeLimitMin') || 30),
        status: fd.get('status') || 'published',
      }),
    });
    toast('Examen creado', exam.code ? `Código: ${exam.code}` : 'Guardado correctamente');
    await refreshTeacher();
  } catch (err) {
    toast('No se pudo crear el examen', err.message, 'err');
  }
}

async function deleteExam(id) {
  if (!confirm('¿Eliminar este examen?')) return;
  try {
    await api(`/exams/${id}`, { method: 'DELETE' });
    toast('Examen eliminado');
    await refreshTeacher();
  } catch (err) {
    toast('No se pudo eliminar', err.message, 'err');
  }
}

async function openStudentsModal(examId) {
  const modal = $('#modal');
  modal.className = 'modal show';
  modal.innerHTML = `<div class="modal-card"><div class="card-header"><h3>Alumnos y resultados</h3><button class="btn btn-ghost btn-sm" data-close-modal>Cerrar</button></div><div class="empty">Cargando...</div></div>`;
  $('[data-close-modal]').addEventListener('click', () => modal.classList.remove('show'));
  try {
    const data = await api(`/exams/${examId}/students`);
    const students = data.activeStudents || [];
    const results = data.results || [];
    modal.innerHTML = `<div class="modal-card">
      <div class="card-header"><h3>Alumnos y resultados</h3><button class="btn btn-ghost btn-sm" data-close-modal>Cerrar</button></div>
      <div class="list">
        ${students.length ? students.map(s => {
          const result = results.find(r => String(r.studentId?._id || r.studentId) === String(s.studentId?._id || s.studentId));
          return `<div class="item"><div class="item-title">${esc(s.studentName || s.studentId?.name || 'Alumno')}</div><div class="badges"><span class="badge ${s.submitted ? 'green' : 'yellow'}">${s.submitted ? 'Entregado' : 'En progreso'}</span>${result ? `<span class="badge green">${result.score}%</span>` : ''}</div></div>`;
        }).join('') : `<div class="empty">Ningún alumno se ha vinculado a este examen.</div>`}
      </div>
    </div>`;
    $('[data-close-modal]').addEventListener('click', () => modal.classList.remove('show'));
  } catch (err) {
    modal.querySelector('.empty').textContent = err.message;
  }
}

function renderResultsManager(root) {
  root.innerHTML = `<div class="card"><h3>Resultados por examen</h3><p>Selecciona un examen para consultar entregas registradas.</p><div class="list">${state.teacherExams.length ? state.teacherExams.map(e => `<button class="btn btn-ghost" data-students-exam="${e._id}">${esc(e.title)} ${e.code ? `· ${esc(e.code)}` : ''}</button>`).join('') : `<div class="empty">No hay exámenes creados.</div>`}</div></div>`;
  $$('[data-students-exam]').forEach(btn => btn.addEventListener('click', () => openStudentsModal(btn.dataset.studentsExam)));
}

function studentView() {
  if (!ensureRole('student')) return;
  shell(`
    <main class="container">
      <section class="card" style="margin-bottom:18px">
        <div class="kicker">Panel estudiante</div>
        <h2>Entrar y contestar examen</h2>
        <p>Ingresa el código publicado por el docente. El front-end consulta el examen en la API, vincula al alumno y envía sus respuestas.</p>
      </section>
      <div class="grid grid-main">
        <section class="card">
          <h3>Entrar con código</h3>
          <form id="code-form" class="form">
            <label>Código de examen<input name="code" maxlength="6" required placeholder="ABC123" style="text-transform:uppercase; letter-spacing:.2em; font-weight:900" /></label>
            <button class="btn btn-primary" type="submit">Buscar examen</button>
          </form>
          <hr style="border:0;border-top:1px solid var(--line);margin:22px 0">
          <h3>Prueba de operación protegida</h3>
          <p class="small muted">Este botón intenta crear una pregunta con rol estudiante. La API debe responder 403.</p>
          <button class="btn btn-danger" id="role-demo">Probar bloqueo por rol</button>
        </section>
        <section id="student-main" class="card">
          ${state.activeExam ? examPreviewHTML() : `<div class="empty">Todavía no has buscado un examen.</div>`}
        </section>
      </div>
    </main>`);
  $('#code-form').addEventListener('submit', findExamByCode);
  $('#role-demo').addEventListener('click', async () => {
    try {
      await api('/questions', { method: 'POST', body: JSON.stringify({ statement: 'Prueba de bloqueo por rol', type: 'multiple_choice', options: ['A','B'], correctAnswer: ['A'] }) });
    } catch (err) {
      toast(`Operación protegida: ${err.status || 403}`, err.message, 'err');
    }
  });
  bindStudentExamActions();
}

async function findExamByCode(e) {
  e.preventDefault();
  const code = new FormData(e.currentTarget).get('code').trim().toUpperCase();
  try {
    const exam = await api(`/exams/code/${encodeURIComponent(code)}`);
    state.activeExam = exam;
    state.selectedAnswers = {};
    state.activeResult = null;
    $('#student-main').innerHTML = examPreviewHTML();
    bindStudentExamActions();
    toast('Examen encontrado', exam.title);
  } catch (err) {
    toast('No se encontró el examen', err.message, 'err');
  }
}

function examPreviewHTML() {
  const exam = state.activeExam;
  const questions = exam.questionIds || [];
  return `<h3>${esc(exam.title)}</h3><p>${esc(exam.description || 'Sin descripción')}</p><div class="badges"><span class="badge green">Código ${esc(exam.code || '')}</span><span class="badge">${questions.length} preguntas</span><span class="badge">${exam.timeLimitMin || 30} min</span></div><div style="margin-top:18px"><button class="btn btn-good" id="join-exam">Vincularme y comenzar</button></div>`;
}

function bindStudentExamActions() {
  $('#join-exam')?.addEventListener('click', joinExam);
  $('#submit-exam')?.addEventListener('click', submitExamAnswers);
  $$('[data-answer]').forEach(btn => btn.addEventListener('click', () => selectAnswer(btn.dataset.questionId, btn.dataset.option, btn.dataset.type)));
}

async function joinExam() {
  try {
    const exam = await api(`/exams/join/${state.activeExam.code}`, { method: 'POST' });
    state.activeExam = exam;
    state.examStartedAt = Date.now();
    renderExamSolver();
    toast('Alumno vinculado', 'Ya puedes contestar el examen.');
  } catch (err) {
    toast('No se pudo iniciar', err.message, 'err');
  }
}

function renderExamSolver() {
  const exam = state.activeExam;
  const questions = exam.questionIds || [];
  $('#student-main').innerHTML = `
    <div class="card-header"><div><h3>${esc(exam.title)}</h3><p class="small muted">Responde y envía cuando termines.</p></div><span class="badge">${questions.length} preguntas</span></div>
    <div class="progress"><div id="progress-bar"></div></div>
    <div class="grid" style="margin-top:18px">
      ${questions.map((q, index) => questionSolverHTML(q, index)).join('')}
    </div>
    <button class="btn btn-primary btn-wide" id="submit-exam" style="margin-top:18px">Enviar respuestas</button>`;
  bindStudentExamActions();
  updateProgress();
}

function questionSolverHTML(q, index) {
  return `<section class="exam-question">
    <div class="kicker">Pregunta ${index + 1}</div>
    <h3>${esc(q.statement)}</h3>
    <p class="small muted">${q.type === 'combined' ? 'Puedes seleccionar varias respuestas.' : 'Selecciona una respuesta.'}</p>
    <div class="answer-grid">${(q.options || []).map((opt, i) => `<button class="answer" data-answer data-question-id="${q._id}" data-type="${q.type}" data-option="${esc(opt)}"><span class="letter">${letters[i] || i + 1}</span><span>${esc(opt)}</span></button>`).join('')}</div>
  </section>`;
}

function selectAnswer(questionId, option, type) {
  const current = state.selectedAnswers[questionId] || [];
  if (type === 'combined') {
    state.selectedAnswers[questionId] = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
  } else {
    state.selectedAnswers[questionId] = [option];
  }
  $$(`[data-question-id="${questionId}"]`).forEach(btn => btn.classList.toggle('active', state.selectedAnswers[questionId].includes(btn.dataset.option)));
  updateProgress();
}

function updateProgress() {
  const total = (state.activeExam?.questionIds || []).length || 1;
  const answered = Object.values(state.selectedAnswers).filter(v => v.length).length;
  const pct = Math.round((answered / total) * 100);
  $('#progress-bar') && ($('#progress-bar').style.width = `${pct}%`);
}

async function submitExamAnswers() {
  const questions = state.activeExam?.questionIds || [];
  const answers = questions.map(q => ({ questionId: q._id, selectedOptions: state.selectedAnswers[q._id] || [] }));
  const timeTaken = state.examStartedAt ? Math.round((Date.now() - state.examStartedAt) / 1000) : 0;
  try {
    const result = await api('/answers', { method: 'POST', body: JSON.stringify({ examId: state.activeExam._id, answers, timeTaken }) });
    state.activeResult = result;
    renderResult(result);
    toast('Examen enviado', `Calificación: ${result.score}%`);
  } catch (err) {
    toast('No se pudo enviar', err.message, 'err');
  }
}

function renderResult(result) {
  $('#student-main').innerHTML = `
    <div class="result-score">
      <div class="score-circle"><strong>${result.score}%</strong></div>
      <h2>Resultado enviado</h2>
      <p>${result.correct}/${result.total} respuestas correctas · tiempo usado: ${formatTime(result.timeTaken || 0)}</p>
    </div>
    <div class="breakdown">${(result.breakdown || []).map(b => `<div class="break ${b.isCorrect ? 'ok' : 'fail'}"><div class="item-title">${b.isCorrect ? '✅' : '❌'} ${esc(b.questionText)}</div><div class="small muted">Tu respuesta: ${esc((b.selectedOptions || []).join(', ') || 'Sin respuesta')}</div><div class="small success">Correcta: ${esc((b.correctAnswer || []).join(', '))}</div></div>`).join('')}</div>
    <div class="row" style="margin-top:18px"><button class="btn btn-ghost" id="back-student">Volver al inicio</button></div>`;
  $('#back-student').addEventListener('click', () => {
    state.activeExam = null;
    state.activeResult = null;
    state.selectedAnswers = {};
    location.hash = '#/student';
    render();
  });
}

function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${String(s).padStart(2, '0')}`;
}

function notFoundView() {
  shell(`<main class="container"><div class="card empty"><h2>Vista no encontrada</h2><p>Regresa al inicio para continuar.</p><a href="#/" class="btn btn-primary">Ir al inicio</a></div></main>`);
}

function render() {
  const route = location.hash.replace('#', '') || '/';
  if (route === '/') return landingView();
  if (route === '/login') return authView('login');
  if (route === '/register') return authView('register');
  if (route === '/teacher') return teacherView();
  if (route === '/student') return studentView();
  return notFoundView();
}

window.addEventListener('hashchange', render);
render();
