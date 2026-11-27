const express = require('express');
const router = express.Router();
const { createProduct, getProducts, deleteProduct } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

router.route('/')
    .get(protect, getProducts)
    .post(protect, isAdmin, upload.single('image'), createProduct);

router.route('/:id')
    .delete(protect, isAdmin, deleteProduct);

module.exports = router;
