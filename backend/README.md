# ExamGen — Back-end API

API REST para el sistema generador de exámenes de respuesta combinada.

## Estructura del proyecto

```
backend/
├── src/
│   ├── app.js                    ← Entrada principal
│   ├── config/
│   │   └── db.js                 ← Conexión MongoDB
│   ├── models/                   ← Esquemas Mongoose
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Exam.js
│   │   └── Result.js
│   ├── repositories/             ← Acceso directo a MongoDB
│   │   ├── user.repository.js
│   │   ├── question.repository.js
│   │   ├── exam.repository.js
│   │   └── result.repository.js
│   ├── services/                 ← Lógica de negocio
│   │   ├── auth.service.js
│   │   ├── question.service.js
│   │   ├── exam.service.js
│   │   └── result.service.js
│   ├── controllers/              ← Manejo de req/res HTTP
│   │   ├── auth.controller.js
│   │   ├── question.controller.js
│   │   ├── exam.controller.js
│   │   └── result.controller.js
│   ├── routes/                   ← Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── question.routes.js
│   │   ├── exam.routes.js
│   │   └── result.routes.js
│   └── middlewares/
│       └── auth.middleware.js    ← JWT + roles
├── postman/
│   └── ExamGen.postman_collection.json
├── swagger.yaml
├── .env.template
└── package.json
```

## Instalación

### 1. Crear MongoDB Atlas (gratis)
1. Entra a https://cloud.mongodb.com y crea una cuenta
2. Crea un cluster gratuito (M0)
3. Ve a **Database Access** → crea un usuario con contraseña
4. Ve a **Network Access** → agrega `0.0.0.0/0` (permite todo)
5. Ve a **Connect** → copia la connection string

### 2. Configurar variables de entorno
```bash
cp .env.template .env
```
Edita `.env` y rellena:
```
MONGODB_URI=mongodb+srv://tuUsuario:tuPassword@tuCluster.mongodb.net/examgen
JWT_SECRET=una_clave_secreta_muy_larga_aqui
```

### 3. Instalar dependencias y correr
```bash
npm install
npm run dev    # desarrollo con nodemon
npm start      # producción
```

### 4. Verificar
Abre http://localhost:3000 — debe responder:
```json
{ "success": true, "message": "ExamGen API corriendo 🚀" }
```

### 5. Swagger UI
http://localhost:3000/api/docs

## Despliegue en Render

1. Sube el código a GitHub (sin `node_modules` ni `.env`)
2. En Render: **New → Web Service** → conecta tu repo
3. Build command: `npm install`
4. Start command: `npm start`
5. En **Environment Variables** agrega: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`

## Endpoints principales

| Método | Ruta                        | Descripción                    | Auth | Rol      |
|--------|-----------------------------|--------------------------------|------|----------|
| POST   | /api/auth/register          | Registro de usuario            | No   | —        |
| POST   | /api/auth/login             | Login, retorna JWT             | No   | —        |
| GET    | /api/auth/me                | Usuario actual                 | Sí   | Any      |
| GET    | /api/questions              | Listar preguntas (filtros+pag) | Sí   | Any      |
| POST   | /api/questions              | Crear pregunta                 | Sí   | teacher  |
| PATCH  | /api/questions/:id          | Editar pregunta                | Sí   | teacher  |
| DELETE | /api/questions/:id          | Eliminar pregunta              | Sí   | teacher  |
| GET    | /api/exams                  | Listar exámenes                | Sí   | Any      |
| POST   | /api/exams                  | Crear examen                   | Sí   | teacher  |
| PATCH  | /api/exams/:id              | Editar examen                  | Sí   | teacher  |
| DELETE | /api/exams/:id              | Eliminar examen                | Sí   | teacher  |
| GET    | /api/exams/code/:code       | Buscar examen por código       | Sí   | student  |
| POST   | /api/exams/join/:code       | Alumno entra con código        | Sí   | student  |
| GET    | /api/exams/:id/students     | Ver alumnos del examen         | Sí   | teacher  |
| POST   | /api/answers                | Alumno envía examen            | Sí   | student  |
| GET    | /api/answers/me             | Mis resultados                 | Sí   | student  |
| GET    | /api/answers/me/:examId     | Mi resultado de un examen      | Sí   | student  |
| GET    | /api/answers/exam/:examId   | Resultados de un examen        | Sí   | teacher  |

## Distribución del equipo

- **Paulo** — Auth (User model, auth.service, auth.controller, auth.routes, middleware JWT)
- **Sebastián** — Exámenes (Exam model, exam.service, exam.controller, exam.routes, result.service)
- **Isaac** — Preguntas y resultados (Question model, Result model, question.*, result.*)
