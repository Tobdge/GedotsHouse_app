require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const checkAuth = require("./src/middleware/checkAuth");

const app = express();

// ============ Middlewares globales ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuth);
app.use(morgan("dev"));

// ============ Motor de vistas ============
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// ============ Archivos estáticos ============
app.use(express.static(path.join(__dirname, "src/public")));

// ============ RUTAS PÚBLICAS ============

// Página de tienda → AHORA ES LA RAÍZ "/"
app.use("/", require("./src/routes/store.views"));

// Rutas de vistas de login/registro
app.use("/", require("./src/routes/auth.views"));

// Rutas de autenticación (POST login/register/logout)
app.use("/auth", require("./src/routes/auth.routes"));

// Perfil de usuario normal
app.use("/account", require("./src/routes/account.routes"));

// Carrito
app.use("/cart", require("./src/routes/cart.routes"));


// ============ RUTAS ADMIN ============

// Gestión de usuarios ahora SÓLO en admin
app.use("/admin/usuarios", require("./src/routes/usuarios"));

// Panel admin
app.use("/admin", require("./src/routes/admin.routes"));
app.use("/checkout", require("./src/routes/checkout.routes"));
app.use("/orders", require("./src/routes/orders.routes"));

// ============ Iniciar Servidor ============
app.listen(8085, () => {
  console.log("Servidor ejecutándose en http://localhost:8085");
});