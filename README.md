# Proyecto: DBGEDOTS — GedotsHouse E-Commerce

Aplicación Node.js + Express + MySQL diseñada como base para un sistema de comercio electrónico orientado a domótica inteligente. Incluye autenticación, catálogo, carrito, órdenes, configuración del sitio y estructura profesional completamente modular.

---

# 1. Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- Node.js v16 o superior
- npm
- MySQL 5.7 u 8+
- phpMyAdmin (opcional)

---

# 2. Instalación de dependencias

En la carpeta raíz del proyecto ejecutar:

npm install

Esto instalará todas las dependencias declaradas en package.json.

---

# 3. Configuración de la Base de Datos

El proyecto incluye la base de datos completa con todos los módulos necesarios para operar.

## Paso 1: Abrir phpMyAdmin

Ingresar a:

http://localhost/phpmyadmin

## Paso 2: Importar la BD

Ejecutar en la pestaña SQL el archivo:

db/bddgedots.sql

Este script:

- Crea la base de datos `dbgedots`
- Crea el usuario MySQL `dbgedots_user`
- Asigna permisos
- Crea todas las tablas del sistema
- Inserta los datos iniciales
- Crea el usuario administrador
- Habilita configuraciones del sitio

---

# 4. Credenciales MySQL creadas automáticamente

Base de datos:

- Nombre: dbgedots  
- Usuario: dbgedots_user  
- Contraseña: 123456  
- Host: localhost  
- Motor: InnoDB  

El script fuerza mysql_native_password para compatibilidad total con Node.js.

---

# 5. Usuario administrador incluido

El script crea automáticamente este usuario:

- Email: admin@gedotshouse.com
- Contraseña: admin123

---

# 6. Ejecutar el servidor

En la carpeta raíz ejecutar:

npx nodemon app.js

Si todo fue instalado correctamente, aparecerá:

Conexión exitosa a la base de datos ‘dbgedots’

---


# 8. Variables de entorno recomendadas (.env)

Crear un archivo `.env`:

PORT=8085
JWT_SECRET=valor_seguro_aqui
DB_HOST=localhost
DB_USER=dbgedots_user
DB_PASS=123456
DB_NAME=dbgedots

---

# 9. Importante

El archivo `bddgedots.sql` incluido en este repositorio es suficiente para que cualquier persona pueda instalar la base de datos en su entorno local sin necesidad de configuraciones adicionales.

El proyecto está listo para ejecutarse después de:

1. Instalar dependencias  
2. Importar la base  
3. Ejecutar nodemon  

---

