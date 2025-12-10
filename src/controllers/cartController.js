const db = require("../../db/connections");

// ===================================================
// OBTENER O CREAR CARRITO
// ===================================================
async function getOrCreateCart(userId) {
    const [[cart]] = await db.query(
        "SELECT id FROM shopping_carts WHERE user_id = ?",
        [userId]
    );

    if (cart) return cart.id;

    const [result] = await db.query(
        "INSERT INTO shopping_carts (user_id) VALUES (?)",
        [userId]
    );

    return result.insertId;
}

// ===================================================
// VER CARRITO
// ===================================================
exports.view = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartId = await getOrCreateCart(userId);

        const [items] = await db.query(`
            SELECT 
                ci.id AS cart_item_id,
                ci.quantity AS cantidad,
                p.id AS id,
                p.name AS nombre,
                p.sku,
                p.price AS precio,
                ci.price_at_addition AS precioFijo,
                p.price AS precioActual,
                p.stock_quantity AS stock,
                (
                    SELECT image_url
                    FROM product_images 
                    WHERE product_id = p.id
                    ORDER BY is_primary DESC, display_order ASC
                    LIMIT 1
                ) AS imagen
            FROM cart_items ci
            INNER JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = ?
        `, [cartId]);

        let subtotal = 0;
        items.forEach(i => subtotal += i.precioFijo * i.cantidad);

        const tax = subtotal * 0.16;
        const total = subtotal + tax;

        res.render("cart", {
            user: req.user,
            items,
            subtotal,
            tax,
            total,
            discount: 0
        });

    } catch (err) {
        console.error("❌ Error al ver carrito:", err);
        res.status(500).send("Error en carrito");
    }
};

// ===================================================
// AGREGAR PRODUCTO
// ===================================================
exports.add = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        const cartId = await getOrCreateCart(userId);

        const [[product]] = await db.query(
            "SELECT price, stock_quantity FROM products WHERE id = ?", 
            [productId]
        );

        if (!product) {
            return res.json({ success: false, message: "Producto no encontrado" });
        }

        if (product.stock_quantity < 1) {
            return res.json({ success: false, message: "Producto sin stock" });
        }

        const [[existing]] = await db.query(
            "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
            [cartId, productId]
        );

        if (existing) {
            await db.query(
                "UPDATE cart_items SET quantity = ? WHERE id = ?",
                [existing.quantity + Number(quantity), existing.id]
            );
        } else {
            await db.query(`
                INSERT INTO cart_items (cart_id, product_id, quantity, price_at_addition)
                VALUES (?, ?, ?, ?)
            `, [cartId, productId, quantity, product.price]);
        }

        res.json({ success: true });

    } catch (err) {
        console.error("❌ Error al agregar:", err);
        res.status(500).json({ success: false, message: "Error al agregar al carrito" });
    }
};

// ===================================================
// ACTUALIZAR CANTIDAD
// ===================================================
exports.update = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const cartId = await getOrCreateCart(userId);

        await db.query(
            "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
            [quantity, cartId, productId]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("❌ Error al actualizar:", err);
        res.json({ success: false });
    }
};

// ===================================================
// ELIMINAR PRODUCTO
// ===================================================
exports.remove = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const cartId = await getOrCreateCart(userId);

        await db.query(
            "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
            [cartId, productId]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("❌ Error al quitar:", err);
        res.json({ success: false });
    }
};