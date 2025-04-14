const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  apartmentName: { type: String, required: true },
  bhkType: { type: String, required: true },
  floors: { type: Number, required: true },
  totalFloors: { type: Number, required: true },
  area: { type: Number, required: true },
  location: {
    city: { type: String, required: true }, // Kept required
    locality: { type: String, required: true }, // Kept required
    landmark: { type: String }, // Optional as before
    coordinates: {
      lat: { type: Number, required: true }, // New required field
      lng: { type: Number, required: true }, // New required field
    },
  },
  rentPrice: { type: Number, required: true },
  deposit: { type: Number, required: true },
  negotiable: { type: Boolean, default: false },
  maintenance: { type: Boolean, default: false },
  maintenanceCost: { type: Number },
  preferredFor: { type: String, required: true },
  furnishing: { type: String, required: true },
  parking: { type: String },
  description: { type: String },
  bathrooms: { type: Number, required: true },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  availabilityDate: { type: Date, default: Date.now },
  status: { type: String, default: 'available' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
  contactedUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    confirmed: { type: Boolean, default: false },
  }],
});

// Add 2dsphere index for geospatial queries
flatSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Flat', flatSchema);