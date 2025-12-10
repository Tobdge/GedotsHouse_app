const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const db = require("../../db/connections");

// ========================================
//   VER DETALLE DE UNA ORDEN
// ========================================
router.get("/:id", verifyJWT, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // Obtener la orden
        const [[order]] = await db.query(`
            SELECT *
            FROM orders
            WHERE id = ? AND user_id = ?
        `, [orderId, userId]);

        if (!order) return res.status(404).send("Orden no encontrada.");

        // Obtener productos
        const [items] = await db.query(`
            SELECT product_name, product_sku, quantity, unit_price, subtotal
            FROM order_items
            WHERE order_id = ?
        `, [orderId]);

        res.render("order_details", { order, items });

    } catch (err) {
        console.error("❌ Error en /orders/:id", err);
        res.status(500).send("Error al cargar detalles de la orden.");
    }
});

module.exports = router;