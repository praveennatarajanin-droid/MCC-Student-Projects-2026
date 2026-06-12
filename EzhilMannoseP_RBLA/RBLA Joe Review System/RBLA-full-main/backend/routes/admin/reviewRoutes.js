// Architect: SP
const express = require('express');
const router = express.Router();
const { 
    getStoreReviews, 
    getReviewStats, 
    getReviewById 
} = require('../../controllers/admin/reviewController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// Apply middleware to all routes
router.use(adminMiddleware);

// Routes
router.get('/', getStoreReviews);
router.get('/stats', getReviewStats);
router.get('/:id', getReviewById);

module.exports = router;
