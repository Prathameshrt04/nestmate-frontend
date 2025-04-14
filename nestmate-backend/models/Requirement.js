const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  forWhom: {
    type: String,
    enum: ['bachelor male', 'bachelor female', 'working male', 'working female'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  maxRent: {
    type: Number,
    required: true,
  },
  shiftingDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fulfilled: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);