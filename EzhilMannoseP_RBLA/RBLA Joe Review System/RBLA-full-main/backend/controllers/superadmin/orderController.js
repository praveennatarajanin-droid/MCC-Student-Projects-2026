// Architect: SP
const Order = require('../../models/user/Order');
const mongoose = require('mongoose');

// Get all orders with filtering
exports.getAllOrders = async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;
        let query = {};

        // Apply filters
        if (status) {
            query.orderStatus = status; 
        }
        if (fromDate || toDate) {
            query.orderDate = {}; 
            if (fromDate) query.orderDate.$gte = new Date(fromDate);
            if (toDate) query.orderDate.$lte = new Date(toDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'name email') 
            .populate('products.product', 'name price') 
            .sort({ orderDate: -1 }); 

        res.json(orders);
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const validStatuses = ['Pending', 'Processing', 'Delivered', 'Canceled']; 
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: status }, 
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error in deleteOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
