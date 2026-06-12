// Architect: SP
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/superadminmiddleware');
const {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../../controllers/superadmin/orderController');

// All routes are protected with superadmin auth middleware
router.use(auth);

// Get all orders with filters
router.get('/', getAllOrders);

// Get single order details
router.get('/:orderId', getOrderById);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

// Delete order (if needed)
router.delete('/:orderId', deleteOrder);

module.exports = router;
