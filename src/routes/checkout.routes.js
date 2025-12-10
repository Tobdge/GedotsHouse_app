// src/routes/checkout.routes.js
const express = require("express");
const router = express.Router();
const db = require("../../db/connections");
const verifyToken = require("../middleware/checkAuth");

/* ======================================================
   1) MOSTRAR CHECKOUT
====================================================== */
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [items] = await db.query(`
            SELECT 
                ci.product_id,
                ci.quantity,
                p.name,
                p.sku,
                p.price
            FROM cart_items ci
            INNER JOIN shopping_carts sc ON sc.id = ci.cart_id
            INNER JOIN products p ON p.id = ci.product_id
            WHERE sc.user_id = ?
        `, [userId]);

        let subtotal = items.reduce((acc, i) => acc + i.quantity * i.price, 0);
        let taxAmount = subtotal * 0.16;
        let total = subtotal + taxAmount;

        res.render("checkout", {
            user: req.user,
            items,
            subtotal,
            taxAmount,
            total
        });

    } catch (err) {
        console.error("❌ Error en GET /checkout:", err);
        res.status(500).send("Error al cargar el checkout");
    }
});

/* ======================================================
   2) PROCESAR PAGO
====================================================== */
router.post("/process", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            customer_email,
            customer_phone,
            shipping_recipient,
            shipping_phone,
            shipping_street,
            shipping_neighborhood,
            shipping_city,
            shipping_state,
            shipping_postal_code,
            shipping_country,
            billing_recipient,
            billing_phone,
            billing_street,
            billing_city,
            billing_state,
            billing_postal_code,
            billing_country,
            payment_method
        } = req.body;

        // Obtener items del carrito
        const [items] = await db.query(`
            SELECT 
                ci.product_id,
                ci.quantity,
                p.name AS product_name,
                p.sku AS product_sku,
                p.price,
                p.stock_quantity
            FROM cart_items ci
            INNER JOIN shopping_carts sc ON sc.id = ci.cart_id
            INNER JOIN products p ON p.id = ci.product_id
            WHERE sc.user_id = ?
        `, [userId]);

        if (items.length === 0) return res.status(400).send("Carrito vacío");

        let subtotal = items.reduce((acc, i) => acc + i.quantity * i.price, 0);
        const tax = 0.16;
        let tax_amount = subtotal * tax;
        let total_amount = subtotal + tax_amount;

        const orderNumber = "ORD-" + Date.now();

        // Insertar orden
        const [orderResult] = await db.query(`
            INSERT INTO orders (
                order_number,
                user_id,
                customer_email,
                customer_phone,
                shipping_recipient,
                shipping_phone,
                shipping_street,
                shipping_neighborhood,
                shipping_city,
                shipping_state,
                shipping_postal_code,
                shipping_country,
                billing_recipient,
                billing_phone,
                billing_street,
                billing_city,
                billing_state,
                billing_postal_code,
                billing_country,
                subtotal,
                tax,
                tax_amount,
                total_amount,
                payment_method,
                payment_status,
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', 'confirmed', NOW())
        `, [
            orderNumber,
            userId,
            customer_email,
            customer_phone,
            shipping_recipient,
            shipping_phone,
            shipping_street,
            shipping_neighborhood,
            shipping_city,
            shipping_state,
            shipping_postal_code,
            shipping_country,
            billing_recipient,
            billing_phone,
            billing_street,
            billing_city,
            billing_state,
            billing_postal_code,
            billing_country,
            subtotal,
            tax,
            tax_amount,
            total_amount,
            payment_method
        ]);

        const orderId = orderResult.insertId;

        /* ======================================================
           INSERTAR ITEMS Y RESTAR STOCK
        ====================================================== */
        for (const item of items) {
            const subtotalItem = item.quantity * item.price;

            // Insertar item de orden
            await db.query(`
                INSERT INTO order_items (
                    order_id,
                    product_id,
                    product_name,
                    product_sku,
                    quantity,
                    unit_price,
                    subtotal
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                orderId,
                item.product_id,
                item.product_name,
                item.product_sku,
                item.quantity,
                item.price,
                subtotalItem
            ]);

            // Restar stock del producto
            await db.query(`
                UPDATE products
                SET stock_quantity = stock_quantity - ?
                WHERE id = ?
            `, [item.quantity, item.product_id]);
        }

        /* ======================================================
           VACIAR CARRITO
        ====================================================== */
        await db.query(`
            DELETE ci FROM cart_items ci
            INNER JOIN shopping_carts sc ON sc.id = ci.cart_id
            WHERE sc.user_id = ?
        `, [userId]);

        // Redirigir al éxito
        res.redirect(`/checkout/success/${orderId}`);

    } catch (err) {
        console.error("❌ Error en POST /checkout/process:", err);
        res.status(500).send("Error al procesar tu compra");
    }
});

/* ======================================================
   3) PANTALLA DE ÉXITO
====================================================== */
router.get("/success/:id", verifyToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const [[order]] = await db.query(`
            SELECT *
            FROM orders
            WHERE id = ? AND user_id = ?
        `, [orderId, userId]);

        if (!order) return res.status(404).send("Orden no encontrada");

        const [items] = await db.query(`
            SELECT product_name, product_sku, quantity, unit_price, subtotal
            FROM order_items
            WHERE order_id = ?
        `, [orderId]);

        res.render("checkout_success", { order, items });

    } catch (err) {
        console.error("❌ Error en GET /checkout/success:", err);
        res.status(500).send("Error al cargar la orden");
    }
});

module.exports = router;