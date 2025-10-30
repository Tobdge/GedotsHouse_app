-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS dbgedots;
USE dbgedots;

DROP USER IF EXISTS 'dbgedots_user'@'localhost';

CREATE USER 'dbgedots_user'@'localhost' IDENTIFIED BY '123456';

GRANT ALL PRIVILEGES ON dbgedots.* TO 'dbgedots_user'@'localhost';

FLUSH PRIVILEGES;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
