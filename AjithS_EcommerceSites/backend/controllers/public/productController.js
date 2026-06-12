// Architect: SP
const Product = require('../../models/Product');
const Category = require('../../models/category');
const mongoose = require('mongoose'); // mongoose is required for ObjectId validation
const path = require('path');
const fs = require('fs');

// Get all products with pagination
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .select('name description new_price old_price images image_url category ratings numOfReviews')
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            success: true,
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get single product details
exports.getProductDetails = async (req, res) => {
    try {
        console.log('Fetching product details for ID:', req.params.id);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            });
        }

        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('Product found:', product.name);
        
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: error.message
        });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let categoryId = category;
        if (!mongoose.Types.ObjectId.isValid(category)) {
            let categoryDoc = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
            if (!categoryDoc) {
                const singular = category.replace(/s$/i, '');
                const plural = category.endsWith('s') ? category : `${category}s`;
                const lookupNames = [singular, plural];
                for (const name of lookupNames) {
                    categoryDoc = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
                    if (categoryDoc) break;
                }
            }
            if (!categoryDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            categoryId = categoryDoc._id;
        }

        const products = await Product.find({ category: categoryId })
            .select('name new_price old_price description images image_url size unit ratings numOfReviews')
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments({ category: categoryId });

        res.status(200).json({
            success: true,
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category',
            error: error.message
        });
    }
};
