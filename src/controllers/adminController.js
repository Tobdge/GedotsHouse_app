const db = require("../../db/connections");

// ============================
// DASHBOARD
// ============================
exports.dashboard = async (req, res) => {
  try {
    // 1. Total ventas
    const [[ventas]] = await db.query(`
      SELECT IFNULL(SUM(total_amount), 0) AS total_ventas
      FROM orders
      WHERE status NOT IN ('cancelled', 'refunded')
    `);

    // 2. Total órdenes
    const [[ordenes]] = await db.query(`
      SELECT COUNT(*) AS total_ordenes
      FROM orders
    `);

    // 3. Total clientes
    const [[clientes]] = await db.query(`
      SELECT COUNT(*) AS total_clientes
      FROM users
      WHERE role='customer'
    `);

    // 4. Total productos + stock bajo
    const [[productos]] = await db.query(`
      SELECT 
        COUNT(*) AS total_productos,
        SUM(CASE WHEN stock_quantity <= low_stock_threshold THEN 1 ELSE 0 END) AS stock_bajo
      FROM products
    `);

    // 5. Ventas por mes (para gráfico)
    const [ventasMes] = await db.query(`
      SELECT 
        MONTH(created_at) AS mes,
        SUM(total_amount) AS total
      FROM orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
      GROUP BY mes
      ORDER BY mes
    `);

    // 6. Top categorías (gráfico)
    const [topCategorias] = await db.query(`
      SELECT 
        c.name AS categoria,
        COUNT(p.id) AS total
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY total DESC
      LIMIT 5
    `);

    // 7. Últimas órdenes
    const [ultimasOrdenes] = await db.query(`
      SELECT 
        id, order_number, customer_email, total_amount, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 8. Productos más vendidos
    const [productosPopulares] = await db.query(`
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    (
        SELECT image_url 
        FROM product_images 
        WHERE product_id = p.id AND is_primary = TRUE
        LIMIT 1
    ) AS image_url,
    SUM(oi.quantity) AS vendidos
  FROM order_items oi
  INNER JOIN products p ON p.id = oi.product_id
  GROUP BY p.id
  ORDER BY vendidos DESC
  LIMIT 5
`);
    // Render
    res.render("admin/dashboard", {
      user: req.user,
      ventas: ventas.total_ventas || 0,
      ordenes: ordenes.total_ordenes || 0,
      clientes: clientes.total_clientes || 0,
      productos: productos.total_productos || 0,
      stock_bajo: productos.stock_bajo || 0,
      ventasMes,
      topCategorias,
      ultimasOrdenes,
      productosPopulares,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Error cargando dashboard");
  }
};

// ============================
// PRODUCTOS
// ============================
exports.listProducts = async (req, res) => {
  const [products] = await db.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC
  `);

  res.render("admin/products", {
    user: req.user,
    products,
  });
};

exports.formCreateProduct = async (req, res) => {
  const [categories] = await db.query(`
    SELECT id, name FROM categories ORDER BY name ASC
  `);

  res.render("admin/createProduct", {
    user: req.user,
    categories,
  });
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      sku,
      category_id,
      short_description,
      description,
      price,
      stock_quantity,
      image_url,
    } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO products
      (name, slug, sku, category_id, short_description, description, price, stock_quantity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `,
      [
        name,
        slug,
        sku,
        category_id,
        short_description,
        description,
        price,
        stock_quantity,
      ]
    );

    await db.query(
      `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES (?, ?, TRUE)
    `,
      [result.insertId, image_url]
    );

    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error creando producto:", err);
    res.status(500).send("Error al crear producto");
  }
};

// ============================
// CATEGORIES
// ============================
exports.listCategories = async (req, res) => {
  const [categories] = await db.query(`
    SELECT id, name, slug, description
    FROM categories
    ORDER BY id DESC
  `);

  res.render("admin/categories", {
    user: req.user,
    categories,
  });
};

exports.createCategory = async (req, res) => {
  const { name, slug, description } = req.body;

  await db.query(
    `
    INSERT INTO categories (name, slug, description)
    VALUES (?, ?, ?)
  `,
    [name, slug, description]
  );

  res.redirect("/admin/categories");
};

// ============================
// ORDERS
// ============================
exports.listOrders = async (req, res) => {
  const [orders] = await db.query(`
    SELECT id, order_number, customer_email, total_amount, status, created_at
    FROM orders
    ORDER BY created_at DESC
  `);

  res.render("admin/orders", {
    user: req.user,
    orders,
  });
};

// ============================
// COUPONS
// ============================
exports.listCoupons = async (req, res) => {
  const [coupons] = await db.query(`
      SELECT 
          id, code, discount_type, discount_value,
          usage_limit, usage_count,
          valid_until, is_active
      FROM coupons
      ORDER BY id DESC
  `);

  res.render("admin/coupons", {
    user: req.user,
    coupons,
  });
};

// ============================
// USERS
// ============================
exports.listUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        id,
        email,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    res.render("admin/users", {
      user: req.user,
      users,
    });
  } catch (err) {
    console.error("Error listando usuarios:", err);
    res.status(500).send("Error cargando usuarios");
  }
};

// ============================
// REVIEWS
// ============================
exports.listReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(`
    SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.email AS user_email,
        p.name AS product_name
    FROM product_reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC
`);
    res.render("admin/reviews", {
      user: req.user,
      reviews,
    });
  } catch (err) {
    console.error("Error listando reviews:", err);
    res.status(500).send("Error cargando reviews");
  }
};

// ============================
// SETTINGS
// ============================
exports.settings = async (req, res) => {
  try {
    res.render("admin/settings", {
      user: req.user,
    });
  } catch (err) {
    console.error("Error cargando settings:", err);
    res.status(500).send("Error cargando ajustes");
  }
};
