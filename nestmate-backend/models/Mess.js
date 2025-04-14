const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  messName: { type: String, required: true },
  description: { type: String, required: true },
  ratePerMonth: { type: Number, required: true },
  ratePerPlate: { type: Number },
  type: { type: String, enum: ['veg', 'nonveg', 'both'], required: true },
  timings: { type: String, required: true },
  location: { 
    city: { type: String }, 
    locality: { type: String },
    landmark: { type: String }, 
    coordinates: {
      lat: { type: Number, required: true }, 
      lng: { type: Number, required: true }, 
    },
  },
  images: [{ type: String }],
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  contactedUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    confirmed: { type: Boolean, default: false },
  }],
});

messSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Mess', messSchema);