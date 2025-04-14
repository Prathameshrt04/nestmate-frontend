const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: String,
  status: { type: String, enum: ['pending', 'responded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contact', ContactSchema);