// -------------------------------------
// ARCHIVO: src/routes/auth.views.js
// -------------------------------------

const express = require("express");
const router = express.Router();

// Mostrar formulario de registro
router.get("/register", (req, res) => {
    res.render("register");
});

// Mostrar formulario de login
router.get("/login", (req, res) => {
    res.render("login");
});

module.exports = router;
