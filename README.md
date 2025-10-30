# Proyecto: DBGEDOTS

## Descripción
Aplicación base Node.js + Express + MySQL que incluye conexión mediante middleware, creación de usuario propio de base de datos y estructura modular para apliación.

## Instalación de módulos

Ejecutar en la terminal:

npm install


## Creación de la base de datos

1. Abrir **phpMyAdmin**.
2. Ejecutar el script `db/basedatos.sql`.
3. Verificar que se haya creado:
   - Base de datos: `dbgedots`
   - Usuario: `dbgedots_user`
   - Contraseña: `123456`
4. Confirmar que la tabla `usuarios` existe.



## Ejecución del servidor

1. En la terminal, ejecutar:

npx nodemon App.js


2. Abrir el navegador y visitar:

http://localhost:8085


3. Deberías ver:

Conexión exitosa a la base de datos 'dbgedots'




## Dependencias utilizadas

| Paquete                  | Descripción                       |
|--------------------------|-----------------------------------|
| **express**              | Framework para servidor web       |
| **mysql**                | Cliente para conexión MySQL       |
| **express-myconnection** | Middleware de conexión            |
| **morgan**               | Logger de peticiones              |
| **nodemon**              | Reinicio automático en desarrollo |



## Estructura del proyecto

NODEE/
│
├── db/
│   ├── bds7a.sql
│   ├── dbgedots.mwb
│
├── node_modules/
│
├── src/
│   ├── controllers/
│   ├── public/
│   ├── routes/
│   └── views/partials/
│
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
└── README.md
