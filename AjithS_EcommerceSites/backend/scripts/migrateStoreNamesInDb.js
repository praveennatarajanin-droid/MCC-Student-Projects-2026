// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Customer = require('../models/customer');
const Admin = require('../models/admin');
const Worker = require('../models/Worker');

const migrateStoreNamesInDb = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for store migration...');

        // 1. Migrate Products
        console.log('\n--- Migrating Products ---');
        const products = await Product.find({});
        let productCount = 0;
        for (const product of products) {
            let updated = false;
            const storeLower = product.store ? product.store.toLowerCase() : '';
            if (storeLower === 'saravana' || storeLower === 'sarvana' || storeLower === 'varnam') {
                product.store = 'enterprises1';
                updated = true;
            } else if (storeLower === 'drsupermarket' || storeLower === 'drspermarket' || storeLower === 'vaagai') {
                product.store = 'enterprises2';
                updated = true;
            } else if (storeLower === 'pandiyan' || storeLower === 'sirugugal' || storeLower === 'siragugal') {
                product.store = 'enterprises3';
                updated = true;
            }

            if (updated) {
                // Disable validation temporarily if we're migrating, but the new values are valid under the updated schema
                await product.save();
                productCount++;
            }
        }
        console.log(`Updated ${productCount} products.`);

        // 2. Migrate Customers
        console.log('\n--- Migrating Customers ---');
        const customers = await Customer.find({});
        let customerCount = 0;
        for (const customer of customers) {
            let updated = false;
            const storeLower = customer.store ? customer.store.toLowerCase() : '';
            if (storeLower === 'saravana' || storeLower === 'sarvana' || storeLower === 'varnam') {
                customer.store = 'enterprises1';
                updated = true;
            } else if (storeLower === 'drsupermarket' || storeLower === 'drspermarket' || storeLower === 'vaagai') {
                customer.store = 'enterprises2';
                updated = true;
            } else if (storeLower === 'pandiyan' || storeLower === 'sirugugal' || storeLower === 'siragugal') {
                customer.store = 'enterprises3';
                updated = true;
            }

            if (updated) {
                await customer.save();
                customerCount++;
            }
        }
        console.log(`Updated ${customerCount} customers.`);

        // 3. Migrate Admins
        console.log('\n--- Migrating Admins ---');
        const admins = await Admin.find({});
        let adminCount = 0;
        for (const admin of admins) {
            let updated = false;
            const storeLower = admin.storeName ? admin.storeName.toLowerCase() : '';
            
            // Map storeName
            if (storeLower === 'saravana' || storeLower === 'sarvana' || storeLower === 'varnam') {
                admin.storeName = 'enterprises1';
                updated = true;
            } else if (storeLower === 'drsupermarket' || storeLower === 'drspermarket' || storeLower === 'vaagai') {
                admin.storeName = 'enterprises2';
                updated = true;
            } else if (storeLower === 'pandiyan' || storeLower === 'sirugugal' || storeLower === 'siragugal') {
                admin.storeName = 'enterprises3';
                updated = true;
            }

            // Map username to match admin schema validator: something@storeName
            if (admin.username) {
                const parts = admin.username.split('@');
                if (parts.length === 2) {
                    const newUsername = `${parts[0]}@${admin.storeName}`;
                    if (admin.username !== newUsername) {
                        admin.username = newUsername;
                        updated = true;
                    }
                }
            }

            if (updated) {
                await admin.save();
                adminCount++;
            }
        }
        console.log(`Updated ${adminCount} admins.`);

        // 4. Migrate Workers
        console.log('\n--- Migrating Workers ---');
        const workers = await Worker.find({});
        let workerCount = 0;
        for (const worker of workers) {
            let updated = false;
            const storeLower = worker.store ? worker.store.toLowerCase() : '';
            if (storeLower === 'saravana' || storeLower === 'sarvana' || storeLower === 'varnam') {
                worker.store = 'enterprises1';
                updated = true;
            } else if (storeLower === 'drsupermarket' || storeLower === 'drspermarket' || storeLower === 'vaagai') {
                worker.store = 'enterprises2';
                updated = true;
            } else if (storeLower === 'pandiyan' || storeLower === 'sirugugal' || storeLower === 'siragugal') {
                worker.store = 'enterprises3';
                updated = true;
            }

            if (updated) {
                await worker.save();
                workerCount++;
            }
        }
        console.log(`Updated ${workerCount} workers.`);

        console.log('\nStore name migration completed successfully!');
    } catch (error) {
        console.error('Error migrating store names in DB:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

migrateStoreNamesInDb();
