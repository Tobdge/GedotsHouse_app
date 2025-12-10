const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/logout", (req, res) => {
    res.clearCookie("token"); // O el nombre de tu cookie JWT
    return res.redirect("/");
});

module.exports = router;
