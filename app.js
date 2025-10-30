const express = require("express");
const mysql = require("mysql");
const myconnection = require("express-myconnection");
const morgan = require("morgan");

const app = express();

app.use(
  myconnection(
    mysql,
    {
      host: "127.0.0.1",
      user: "dbgedots_user",   
      password: "123456",      
      port: 3306,              
      database: "dbgedots"     
    },
    "single"
  )
);

// Middlewares útiles
app.use(morgan("dev"));
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {
      console.error("Error al conectar con la base de datos:", err);
      res.status(500).send("Error de conexión a la base de datos");
      return;
    }

    conn.query("SHOW TABLES", (err, rows) => {
      if (err) {
        console.error("Error al ejecutar consulta:", err);
        res.status(500).send("Error al ejecutar consulta SQL");
        return;
      }

      res.json({
        mensaje: "Conexión exitosa a la base de datos 'dbgedots'",
        tablas: rows
      });
    });
  });
});

app.listen(8085, () => {
  console.log("Servidor ejecutándose en http://localhost:8085");
});
