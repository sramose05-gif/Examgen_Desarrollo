# ExamGen Front-end

Front-end estático en HTML, CSS y JavaScript para consumir la API REST de ExamGen.

## Deploy en Render

1. Subir este proyecto a GitHub.
2. En Render seleccionar **New → Static Site**.
3. Seleccionar el repositorio.
4. Configurar:
   - Root Directory: `frontend`
   - Build Command: dejar vacío o usar `echo "static site"`
   - Publish Directory: `.`
5. Crear el Static Site.

## API

Por defecto usa:

```txt
https://examgen-desarrollo.onrender.com/api
```

Desde la pantalla inicial se puede cambiar la URL de API si el back-end usa otro servicio de Render.
