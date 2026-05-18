# ExamGen Full Stack Final

Este paquete contiene:

- `backend/`: API REST con Express, MongoDB, JWT, roles y validaciones con express-validator.
- `frontend/`: aplicación web estática lista para desplegar en Render como Static Site.

## Deploy back-end en Render

Crear un Web Service:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Variables: ver `backend/.env.template`

## Deploy front-end en Render

Crear un Static Site:

- Root Directory: `frontend`
- Build Command: vacío o `echo "static site"`
- Publish Directory: `.`
