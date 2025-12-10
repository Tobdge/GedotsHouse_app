const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");

const adminController = require("../controllers/adminController");

// DASHBOARD
router.get("/dashboard", verifyJWT, verifyAdmin, adminController.dashboard);

// PRODUCTS
router.get("/products", verifyJWT, verifyAdmin, adminController.listProducts);
router.get("/products/create", verifyJWT, verifyAdmin, adminController.formCreateProduct);
router.post("/products/create", verifyJWT, verifyAdmin, adminController.createProduct);

// CATEGORIES
router.get("/categories", verifyJWT, verifyAdmin, adminController.listCategories);
router.post("/categories/create", verifyJWT, verifyAdmin, adminController.createCategory);

// ORDERS
router.get("/orders", verifyJWT, verifyAdmin, adminController.listOrders);

// COUPONS
router.get("/coupons", verifyJWT, verifyAdmin, adminController.listCoupons);

// USERS
router.get("/users", verifyJWT, verifyAdmin, adminController.listUsers);

// REVIEWS
router.get("/reviews", verifyJWT, verifyAdmin, adminController.listReviews);

// SETTINGS
router.get("/settings", verifyJWT, verifyAdmin, adminController.settings);

module.exports = router;