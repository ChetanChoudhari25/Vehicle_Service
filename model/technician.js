const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobileNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Technician = mongoose.model('Technician', technicianSchema);

module.exports = Technician;
