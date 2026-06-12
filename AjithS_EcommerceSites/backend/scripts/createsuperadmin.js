// Architect: SP
const path = require('path');
const mongoose = require('mongoose');
const Superadmin = require('../models/superadmin');
const connectDB = require('../utils/database/mongoConfig');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function createSuperadmin() {
  const username = 'paul786';
  const password = 'paul9801';

  try {
    await connectDB();

    let superadmin = await Superadmin.findOne({ username });

    if (superadmin) {
      superadmin.password = password;
      await superadmin.save();
      console.log(`Superadmin updated successfully with username: ${username}`);
    } else {
      superadmin = new Superadmin({ username, password });
      await superadmin.save();
      console.log(`Superadmin created successfully with username: ${username}`);
    }
  } catch (err) {
    console.error('Error creating/updating superadmin:', err);
  } finally {
    mongoose.disconnect();
  }
}

createSuperadmin();
