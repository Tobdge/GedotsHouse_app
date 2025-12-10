const db = require("../../db/connections");
const bcrypt = require("bcryptjs");

// =====================================================
// LISTAR USUARIOS
// =====================================================
exports.listar = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, email, is_active, email_verified_at, created_at
            FROM users
            WHERE deleted_at IS NULL
            ORDER BY id DESC
        `);

        res.render("usuarios", { users });

    } catch (err) {
        console.error("❌ Error listando usuarios:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// =====================================================
// FORMULARIO CREAR
// =====================================================
exports.formCrear = (req, res) => {
    res.render("crear");
};

// =====================================================
// CREAR USUARIO
// =====================================================
exports.crear = async (req, res) => {
    try {
        const { email, password, is_active } = req.body;

        const hash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (email, password_hash, is_active, created_at)
             VALUES (?, ?, ?, NOW())`,
            [email, hash, is_active ? 1 : 0]
        );

        res.redirect("/usuarios");

    } catch (err) {
        console.error("❌ Error creando usuario:", err);
        res.status(500).json({ error: "No se pudo crear el usuario" });
    }
};

// =====================================================
// FORMULARIO EDITAR
// =====================================================
exports.formEditar = async (req, res) => {
    try {
        const { id } = req.params;

        const [[user]] = await db.query(
            `SELECT id, email, is_active 
             FROM users 
             WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        res.render("editar", { user });

    } catch (err) {
        console.error("❌ Error cargando formulario de edición:", err);
        res.status(500).json({ error: "Error interno" });
    }
};

// =====================================================
// EDITAR USUARIO
// =====================================================
exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, is_active } = req.body;

        await db.query(
            `UPDATE users 
             SET email = ?, is_active = ?, updated_at = NOW()
             WHERE id = ?`,
            [email, is_active ? 1 : 0, id]
        );

        res.redirect("/usuarios");

    } catch (err) {
        console.error("❌ Error editando usuario:", err);
        res.status(500).json({ error: "No se pudo actualizar el usuario" });
    }
};

// =====================================================
// ELIMINAR (SOFT DELETE)
// =====================================================
exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
            [id]
        );

        res.redirect("/usuarios");

    } catch (err) {
        console.error("❌ Error eliminando usuario:", err);
        res.status(500).json({ error: "No se pudo eliminar el usuario" });
    }
};