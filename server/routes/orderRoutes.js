const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, isAdmin, getOrders);

router.route('/:id/status')
    .put(protect, isAdmin, updateOrderStatus);

module.exports = router;
