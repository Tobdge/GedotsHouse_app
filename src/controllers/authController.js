const db = require("../../db/connections");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        // Revisar si ya existe
        const [[existing]] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing) {
            return res.status(400).json({ error: "El email ya existe" });
        }

        const hash = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            [email, hash]
        );

        res.json({ success: true, message: "Usuario registrado" });

    } catch (err) {
        console.error("❌ Error en register:", err);
        res.status(500).json({ error: "Error interno" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [[user]] = await db.query(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 604800000 // 7 días
        });

        

          return res.json({
              success: true,
              message: "Login correcto",
              redirect: user.role === "super_admin"
                  ? "/admin/dashboard"
                  : "/tienda"
          });
    } catch (err) {
        console.error("❌ Error en login:", err);
        res.status(500).json({ error: "Error interno" });
    }
};