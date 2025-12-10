const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const cartController = require("../controllers/cartController");

// Las rutas del carrito SIEMPRE requieren login
router.get("/", verifyJWT, cartController.view);
router.post("/add", verifyJWT, cartController.add);
router.post("/update", verifyJWT, cartController.update);
router.post("/remove", verifyJWT, cartController.remove);

module.exports = router;
