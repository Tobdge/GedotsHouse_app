-- ============================================
-- GEDOTSHOUSE - BASE DE DATOS COMPLETA
-- E-commerce de Domótica Premium
-- ============================================

DROP DATABASE IF EXISTS dbgedots;
CREATE DATABASE IF NOT EXISTS dbgedots CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dbgedots;

-- Usuario de la BD
DROP USER IF EXISTS 'dbgedots_user'@'localhost';
CREATE USER 'dbgedots_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON dbgedots.* TO 'dbgedots_user'@'localhost';
FLUSH PRIVILEGES;

ALTER USER 'dbgedots_user'@'localhost'
IDENTIFIED WITH mysql_native_password BY '123456';

-- ============================================
-- 1. MÓDULO DE USUARIOS Y AUTENTICACIÓN
-- ============================================

-- Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'super_admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    failed_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Direcciones de usuarios (múltiples por usuario)
CREATE TABLE IF NOT EXISTS user_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    address_type ENUM('billing', 'shipping', 'both') DEFAULT 'shipping',
    recipient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'México',
    is_default BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_address_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens de sesión (JWT/Refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. MÓDULO DE CATÁLOGO DE PRODUCTOS
-- ============================================

-- Categorías de productos (jerárquicas)
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- emoji o clase de icono
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id)
        REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Marcas de productos
CREATE TABLE IF NOT EXISTS brands (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Productos
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    brand_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    
    -- Precios
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2) NULL, -- precio antes de descuento
    cost_price DECIMAL(10, 2) NULL, -- costo interno
    
    -- Inventario
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    manage_stock BOOLEAN DEFAULT TRUE,
    
    -- Estado
    status ENUM('draft', 'active', 'inactive', 'discontinued') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Estadísticas
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    reviews_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_product_brand FOREIGN KEY (brand_id)
        REFERENCES brands(id) ON DELETE SET NULL,
    
    INDEX idx_category (category_id),
    INDEX idx_brand (brand_id),
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_price (price),
    FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Imágenes de productos
CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Especificaciones técnicas de productos
CREATE TABLE IF NOT EXISTS product_specifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    spec_name VARCHAR(100) NOT NULL,
    spec_value TEXT NOT NULL,
    display_order INT DEFAULT 0,
    CONSTRAINT fk_spec_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Etiquetas de productos (tags)
CREATE TABLE IF NOT EXISTS product_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación productos-etiquetas (muchos a muchos)
CREATE TABLE IF NOT EXISTS product_tag_relations (
    product_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    CONSTRAINT fk_ptr_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_ptr_tag FOREIGN KEY (tag_id)
        REFERENCES product_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reseñas de productos
CREATE TABLE IF NOT EXISTS product_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NULL, -- solo usuarios que compraron pueden reseñar
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. MÓDULO DE CARRITO DE COMPRAS
-- ============================================

-- Carrito de compras
CREATE TABLE IF NOT EXISTS shopping_carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL, -- NULL para carritos de invitados
    session_id VARCHAR(255) NULL, -- para carritos sin login
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_addition DECIMAL(10, 2) NOT NULL, -- precio al momento de agregar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id)
        REFERENCES shopping_carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_cart (cart_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. MÓDULO DE CUPONES Y DESCUENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2) NULL, -- máximo descuento para porcentajes
    usage_limit INT NULL, -- usos totales permitidos
    usage_count INT DEFAULT 0,
    usage_limit_per_user INT DEFAULT 1,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registro de uso de cupones
CREATE TABLE IF NOT EXISTS coupon_usage (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_coupon FOREIGN KEY (coupon_id)
        REFERENCES coupons(id) ON DELETE CASCADE,
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coupon (coupon_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. MÓDULO DE ÓRDENES Y VENTAS
-- ============================================

-- Órdenes de compra
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Estado de la orden
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Información de contacto
    customer_email VARCHAR(191) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Dirección de envío
    shipping_recipient VARCHAR(150) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,
    shipping_neighborhood VARCHAR(100),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(50) NOT NULL,
    
    -- Dirección de facturación (puede ser diferente)
    billing_recipient VARCHAR(150),
    billing_phone VARCHAR(20),
    billing_street VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(50),
    
    -- Montos
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50) NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Pago
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery') NOT NULL,
    payment_transaction_id VARCHAR(255),
    paid_at TIMESTAMP NULL,
    
    -- Envío
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Notas
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    
    CONSTRAINT fk_order_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_user (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items de la orden (productos comprados)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- snapshot del nombre
    product_sku VARCHAR(100) NOT NULL, -- snapshot del SKU
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL, -- precio al momento de compra
    subtotal DECIMAL(10, 2) NOT NULL, -- quantity * unit_price
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historial de estados de orden
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL,
    notes TEXT,
    changed_by BIGINT UNSIGNED NULL, -- admin que hizo el cambio
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by)
        REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. MÓDULO DE LISTA DE DESEOS
-- ============================================

CREATE TABLE IF NOT EXISTS wishlists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. MÓDULO DE NOTIFICACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('order_update', 'promotion', 'product_back_in_stock', 'review_request', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. MÓDULO DE CONFIGURACIÓN DEL SITIO
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar configuraciones básicas del sitio
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'GedotsHouse', 'text', 'Nombre de la tienda'),
('site_email', 'info@gedotshouse.com', 'text', 'Email de contacto'),
('site_phone', '+52 123 456 7890', 'text', 'Teléfono de contacto'),
('currency', 'MXN', 'text', 'Moneda del sitio'),
('tax_rate', '16', 'number', 'IVA en porcentaje'),
('free_shipping_threshold', '1500', 'number', 'Monto mínimo para envío gratis'),
('low_stock_alert', '5', 'number', 'Alerta de stock bajo');

-- Insertar usuario administrador por defecto (password: admin123)
INSERT INTO users (email, password_hash, role, is_active, email_verified_at) VALUES
('admin@gedotshouse.com', '$2b$10$rBV2kL6RhIGHSEW1KxBGZeQ0nKQdYpXGOyB.LUqJVH6YxFYD8YBFW', 'super_admin', TRUE, NOW());

-- Insertar categorías principales
INSERT INTO categories (name, slug, description, icon, is_active, display_order) VALUES
('Iluminación Inteligente', 'iluminacion-inteligente', 'Control total de ambientes con luces LED inteligentes', '💡', TRUE, 1),
('Seguridad & Acceso', 'seguridad-acceso', 'Protección avanzada con cerraduras y cámaras inteligentes', '🔐', TRUE, 2),
('Climatización', 'climatizacion', 'Termostatos y control de temperatura inteligente', '🌡️', TRUE, 3),
('Audio & Video', 'audio-video', 'Sistemas de entretenimiento premium para el hogar', '🎵', TRUE, 4),
('Persianas & Cortinas', 'persianas-cortinas', 'Automatización de persianas y cortinas', '🪟', TRUE, 5),
('Ecosistemas Completos', 'ecosistemas-completos', 'Kits completos de domótica', '🏠', TRUE, 6);

-- Insertar marcas populares
INSERT INTO brands (name, slug, description, is_active) VALUES
('Philips Hue', 'philips-hue', 'Líder mundial en iluminación inteligente', TRUE),
('Nest', 'nest', 'Termostatos y seguridad de Google', TRUE),
('Ring', 'ring', 'Seguridad para el hogar de Amazon', TRUE),
('Sonos', 'sonos', 'Audio multiroom premium', TRUE),
('Aqara', 'aqara', 'Domótica económica y de calidad', TRUE);



INSERT INTO users (email, password_hash, role, is_active, email_verified_at)
VALUES ('admin@gedotshouse.com',
        '$2b$10$rBV2kL6RhIGHSEW1KxBGZeQ0nKQdYpXGOyB.LUqJVH6YxFYD8YBFW',
        'super_admin',
        TRUE,
        NOW());
        
        
        
SELECT * FROM users WHERE email = 'admin@gedotshouse.com';     


UPDATE users 
SET password_hash = '$2b$10$cIYum51lbY4vkduANUyPWuY7OU5w6ffTtp3hwC1BO11ukgX.4QdWe'
WHERE email = 'admin@gedotshouse.com';   

SHOW COLUMNS FROM orders;
ALTER TABLE orders 
ADD COLUMN tax DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER subtotal;




SHOW COLUMNS FROM orders LIKE 'payment_method';


SHOW CREATE TABLE order_items;

SELECT * FROM cart_items;
SELECT * FROM shopping_carts WHERE user_id = 3;

UPDATE shopping_carts
SET user_id = 3
WHERE id = 1;

SHOW DATABASES;