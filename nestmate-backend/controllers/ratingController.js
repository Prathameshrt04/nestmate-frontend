const Rating = require('../models/Rating');
const Contact = require('../models/Contact');
const Flat = require('../models/Flat');
const Service = require('../models/Service');
const Mess = require('../models/Mess');

exports.getPendingRatings = async (req, res) => {
  try {
    const flats = await Flat.find({ 'contactedUsers.userId': req.user.id, 'contactedUsers.confirmed': true });
    const services = await Service.find({ 'contactedUsers.userId': req.user.id, 'contactedUsers.confirmed': true });
    const messes = await Mess.find({ 'contactedUsers.userId': req.user.id, 'contactedUsers.confirmed': true });

    const existingRatings = await Rating.find({ userId: req.user.id });
    const ratedIds = existingRatings.map(r => r.targetId.toString());

    const pending = [
      ...flats.map(f => ({ type: 'flat', targetId: f._id, name: f.apartmentName })),
      ...services.map(s => ({ type: 'service', targetId: s._id, name: s.name })),
      ...messes.map(m => ({ type: 'mess', targetId: m._id, name: m.messName })),
    ].filter(item => !ratedIds.includes(item.targetId.toString()));

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.ignorePendingRating = async (req, res) => {
  try {
    // Placeholder for future use; currently handled by removeContactedUser
    res.json({ message: 'Rating ignored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRatings = async (req, res) => {
  const { type, targetId } = req.params;
  try {
    let ratings;
    if (type === 'user') {
      ratings = await Rating.find({ userId: targetId }).populate('userId', 'name');
    } else {
      ratings = await Rating.find({ type, targetId }).populate('userId', 'name');
    }
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRating = async (req, res) => {
  const { type, targetId, rating, comment } = req.body;
  try {
    let targetModel;
    if (type === 'flat') targetModel = Flat;
    else if (type === 'service') targetModel = Service;
    else if (type === 'mess') targetModel = Mess;
    else return res.status(400).json({ message: 'Invalid target type' });

    const target = await targetModel.findById(targetId);
    if (!target) return res.status(404).json({ message: `${type} not found` });

    const hasContacted = target.contactedUsers.find(
      (c) => c.userId.toString() === req.user.id && c.confirmed
    );
    if (!hasContacted) {
      return res.status(403).json({ message: 'You must contact the provider/owner and be confirmed first' });
    }

    const existingRating = await Rating.findOne({ userId: req.user.id, targetId });
    if (existingRating) return res.status(400).json({ message: 'You have already rated this target' });

    const newRating = new Rating({
      type,
      targetId,
      userId: req.user.id,
      rating,
      comment,
      verified: true,
    });

    await newRating.save();
    res.status(201).json(newRating);
  } catch (error) {
    console.error('Rating Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    if (rating.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(rating, req.body);
    rating.updatedAt = Date.now();
    await rating.save();
    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    if (rating.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Use deleteOne instead of remove (fixes Issue 2)
    await Rating.deleteOne({ _id: rating._id });
    res.json({ message: 'Rating deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};