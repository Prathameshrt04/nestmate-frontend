const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceType: { type: String, required: true }, // "cleaning" or "laundry"
  name: { type: String, required: true },
  description: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { // New field with textual and coordinates
    city: { type: String }, // Optional
    locality: { type: String }, // Optional
    landmark: { type: String }, // Optional
    coordinates: {
      lat: { type: Number, required: true }, // Required
      lng: { type: Number, required: true }, // Required
    },
  },
  // Cleaning-specific fields
  chargeType: { type: String, enum: ['perHour', 'fixedBHK'] },
  rate: { type: Number },
  workingDays: { type: [String] },
  workingTime: { type: String },
  // Laundry-specific fields
  chargePerShirt: { type: Number },
  chargePerCloth: { type: Number },
  images: [{ type: String }],
  status: { type: String, default: 'active' },
  updatedAt: { type: Date, default: Date.now },
  contactedUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    confirmed: { type: Boolean, default: false },
  }],
});

// Add 2dsphere index for geospatial queries
serviceSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Service', serviceSchema);