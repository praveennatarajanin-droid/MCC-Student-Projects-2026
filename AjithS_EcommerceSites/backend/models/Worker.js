// Architect: SP
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phoneNo: { type: String, required: true },
    email: { type: String, required: false },
    address: { type: String, required: true },
    role: { type: String, required: true },
    store: { type: String, required: true },
    salary: { type: Number, required: false },
    unit: { type: String, required: false },
    aadharNo: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Worker', workerSchema);
