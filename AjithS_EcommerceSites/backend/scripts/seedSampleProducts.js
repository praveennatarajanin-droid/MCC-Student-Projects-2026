const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../utils/database/mongoConfig');
const Product = require('../models/Product');
const Category = require('../models/category');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const storeTypes = ['enterprises1', 'enterprises2', 'enterprises3'];

const categorySamples = {
  Towels: [
    'Soft Cotton Towels',
    'Block Print Towels',
    'Handloom Towels',
    'Luxe Spa Towels',
    'Eco-Friendly Towel Set',
    'Stripe Weave Towels',
    'Floral Print Towels',
    'Natural Dyed Towels',
    'Lightweight Beach Towels',
    'Classic Bath Towels'
  ],
  Bags: [
    'Canvas Tote Bag',
    'Block Print Sling Bag',
    'Handcrafted Satchel Bag',
    'Eco Shopper Bag',
    'Bamboo Handle Handbag',
    'Boho Sling Bag',
    'Printed Pouch Bag',
    'Zip Closure Travel Bag',
    'Market Shoulder Bag',
    'Minimalist Everyday Bag'
  ],
  Napkins: [
    'Printed Cotton Napkins',
    'Embroidered Dinner Napkins',
    'Block Print Napkin Set',
    'Linen Style Napkins',
    'Floral Dining Napkins',
    'Eco-Friendly Napkins',
    'Handloom Table Napkins',
    'Festive Napkin Set',
    'Classic White Napkins',
    'Soft Reusable Napkins'
  ],
  'Paper Files': [
    'Handmade File Folder',
    'Block Print Document File',
    'Craft Paper Organizer',
    'Recycled Paper File Set',
    'Textured Stationery Folder',
    'Printed Paper File',
    'Eco-Friendly Document Folio',
    'Artisan Paper Folder',
    'School Project File',
    'Office File Organizer'
  ],
  Bedsheets: [
    'Floral Bedsheet Set',
    'Soft Cotton Bedsheet',
    'Handloom Bedsheet',
    'Printed Bedsheet Set',
    'Luxury Bed Cover',
    'Striped Bedsheet',
    'Pastel Bedsheet',
    'Ethnic Print Bedsheet',
    'Bedroom Comfort Set',
    'Premium King Bedsheet'
  ],
  Cupcoasters: [
    'Handmade Coaster Set',
    'Block Print Coasters',
    'Bamboo Coaster Set',
    'Marble Effect Coasters',
    'Floral Coaster Set',
    'Eco Cork Coasters',
    'Printed Cup Coasters',
    'Boho Coaster Set',
    'Minimalist Coasters',
    'Color Block Coasters'
  ]
};

const descriptions = {
  Towels: 'A beautifully crafted towel made from premium cotton for comfort, absorbency, and everyday luxury.',
  Bags: 'A stylish and durable bag perfect for daily use, crafted with artisan details and strong handles.',
  Napkins: 'Elegant reusable napkins that bring a handmade charm to your dining table and reduce waste.',
  'Paper Files': 'A handcrafted paper file designed to store documents with style, ideal for office and school use.',
  Bedsheets: 'A soft, breathable bedsheet created for comfort and beautiful bedroom style.',
  Cupcoasters: 'A set of attractive coasters that protect surfaces while adding decorative flair to your table.'
};

const placeholderBaseUrl = 'https://via.placeholder.com/500x500.png?text=';

const generateProducts = async () => {
  await connectDB();

  const categoryIds = {};
  for (const categoryName of Object.keys(categorySamples)) {
    const category = await Category.findOneAndUpdate(
      { name: categoryName },
      { name: categoryName },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryIds[categoryName] = category._id;
  }

  const productsToInsert = [];

  for (const [categoryName, names] of Object.entries(categorySamples)) {
    names.forEach((productName, index) => {
      const basePrice = 250 + 50 * index;
      const oldPrice = basePrice + 80;
      const stock = 8 + (index % 6) * 3;
      const size = {
        breadth: 30 + (index % 5) * 5,
        height: 45 + (index % 5) * 4,
      };
      const imageLabel = encodeURIComponent(`${categoryName}-${index + 1}`);
      const imageUrl = `${placeholderBaseUrl}${imageLabel}`;

      productsToInsert.push({
        name: productName,
        description: `${descriptions[categoryName]} ${productName} is made with care and designed to enhance everyday life.`,
        new_price: basePrice,
        old_price: oldPrice,
        stock,
        category: categoryIds[categoryName],
        store: storeTypes[index % storeTypes.length],
        size,
        images: [imageUrl],
        image_url: imageUrl,
        isActive: true,
      });
    });
  }

  const existingNames = productsToInsert.map((product) => product.name);
  await Product.deleteMany({ name: { $in: existingNames } });
  await Product.insertMany(productsToInsert);

  console.log(`Seeded ${productsToInsert.length} sample products across ${Object.keys(categorySamples).length} categories.`);
  process.exit(0);
};

seed = async () => {
  try {
    await generateProducts();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
