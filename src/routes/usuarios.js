const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const verifyJWT = require("../middleware/verifyJWT");


router.get("/", verifyJWT, usuariosController.listar);

router.get("/crear", usuariosController.formCrear);
router.post("/crear", usuariosController.crear);
router.get("/editar/:id", usuariosController.formEditar);
router.post("/editar/:id", usuariosController.editar);
router.get("/eliminar/:id", usuariosController.eliminar);

module.exports = router;
