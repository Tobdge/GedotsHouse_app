const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");

router.get("/", verifyJWT, (req, res) => {
  res.json({
    msg: "Perfil del usuario",
    user: req.user
  });
});

module.exports = router;
