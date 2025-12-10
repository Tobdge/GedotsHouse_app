const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const db = require("../../db/connections");

// ========================================
//  GET /account
// ========================================
router.get("/", verifyJWT, async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT id, total_amount, created_at 
             FROM orders 
             WHERE user_id = ? 
             ORDER BY id DESC`,
            [req.user.id]
        );

        res.render("account", {
            user: req.user,
            orders
        });

    } catch (err) {
        console.error("Error en /account", err);

        res.render("account", {
            user: req.user,
            orders: []
        });
    }
});

module.exports = router;