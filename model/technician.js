const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobileNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String },
  garageAddress: { type: String, required: true },
  experience: { type: Number, required: true },
  certifications: { type: String, required: true },
  governmentId: { type: String, required: true },
  approved: { type: Boolean, default: false } // New field for approval status
});

const Technician = mongoose.model('Technician', technicianSchema);

module.exports = Technician;
