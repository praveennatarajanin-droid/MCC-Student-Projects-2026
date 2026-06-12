const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Category = require('../models/category');
const Product = require('../models/Product');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const categories = await Category.find().lean();
    console.log('CATEGORIES:', categories);

    const products = await Product.find().limit(20).populate('category', 'name').lean();
    console.log('PRODUCTS:', products.map((p) => ({
      name: p.name,
      category: p.category ? p.category.name : p.category,
      categoryRaw: p.category,
    })));

    const stats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    console.log('CATEGORY STATS:', stats);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
