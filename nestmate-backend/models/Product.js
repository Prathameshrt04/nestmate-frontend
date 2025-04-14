const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  category: { type: String, enum: ['furniture', 'decor'], required: true },
  name: { type: String, required: true },
  description: String,
  affiliateLink: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', ProductSchema);