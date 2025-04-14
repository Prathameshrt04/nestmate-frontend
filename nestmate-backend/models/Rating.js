const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  type: { type: String, enum: ['flat', 'service', 'mess'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to Flat or Service
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: {type:String},
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rating', RatingSchema);
