const express = require("express");
const router = express.Router();
const db = require("../../db/connections");

// ====================================================
// OBTENER O CREAR CARRITO
// ====================================================
async function getOrCreateCart(userId) {
    if (!userId) return null;

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

// ====================================================
// FUNCIÓN QUE RENDERIZA LA TIENDA
// ====================================================
async function renderStore(req, res) {
    try {
        // Obtener productos reales
        const [products] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.short_description,
                (
                    SELECT image_url FROM product_images 
                    WHERE product_id = p.id AND is_primary = 1 LIMIT 1
                ) AS image_url,
                p.stock_quantity,
                c.name AS category_name,
                (
                    SELECT COUNT(*) 
                    FROM product_reviews r 
                    WHERE r.product_id = p.id
                ) AS reviews_count
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.status = 'active'
            ORDER BY p.id DESC
            LIMIT 40
        `);

        // Obtener categorías reales
        const [categories] = await db.query(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.icon,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
            FROM categories c
            WHERE c.is_active = 1
            ORDER BY c.display_order ASC
        `);

        // CART COUNT real
        let cartCount = 0;

        if (req.user) {
            const cartId = await getOrCreateCart(req.user.id);

            if (cartId) {
                const [[count]] = await db.query(
                    "SELECT SUM(quantity) AS total FROM cart_items WHERE cart_id = ?",
                    [cartId]
                );
                cartCount = count?.total || 0;
            }
        }

        // Wishlist (aún no implementada)
        const wishlistCount = 0;

        // Render
        return res.render("index", {
            user: req.user || null,
            products,
            categories,
            cartCount,
            wishlistCount
        });

    } catch (err) {
        console.error("❌ Error en tienda:", err);

        return res.render("index", {
            user: req.user || null,
            products: [],
            categories: [],
            cartCount: 0,
            wishlistCount: 0
        });
    }
}

// ====================================================
// RUTAS
// ====================================================

// 🏪 ***HOME — LA TIENDA***
router.get("/", renderStore);

// (Opcional) /tienda redirige al home
router.get("/tienda", (req, res) => res.redirect("/"));

// Export
module.exports = router;