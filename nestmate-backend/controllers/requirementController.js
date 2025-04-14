const Requirement = require('../models/Requirement');

exports.getUserRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ userId: req.user.id }).populate('userId', 'name email phone');
    res.json(requirements);
  } catch (error) {
    console.error('Error in getUserRequirements:', error);
    res.status(500).json({ message: 'Server error while fetching user requirements' });
  }
};

exports.getAllRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ fulfilled: false }).populate('userId', 'name email phone');
    res.json(requirements);
  } catch (error) {
    console.error('Error in getAllRequirements:', error);
    res.status(500).json({ message: 'Server error while fetching all requirements' });
  }
};

exports.createRequirement = async (req, res) => {
  const { forWhom, location, maxRent, shiftingDate, description } = req.body;
  try {
    if (!forWhom || !location || !maxRent || !shiftingDate || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const requirement = new Requirement({
      userId: req.user.id,
      forWhom,
      location,
      maxRent: Number(maxRent),
      shiftingDate: new Date(shiftingDate),
      description,
    });
    await requirement.save();
    res.status(201).json(requirement);
  } catch (error) {
    console.error('Error in createRequirement:', error);
    res.status(500).json({ message: 'Server error while creating requirement' });
  }
};

exports.updateRequirement = async (req, res) => {
  const { id } = req.params;
  try {
    const requirement = await Requirement.findById(id);
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
    if (requirement.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    const updatedRequirement = await Requirement.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedRequirement);
  } catch (error) {
    console.error('Error in updateRequirement:', error);
    res.status(500).json({ message: 'Server error while updating requirement' });
  }
};

exports.deleteRequirement = async (req, res) => {
  const { id } = req.params;
  try {
    const requirement = await Requirement.findById(id);
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
    if (requirement.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await Requirement.deleteOne({ _id: id });
    res.json({ message: 'Requirement deleted' });
  } catch (error) {
    console.error('Error in deleteRequirement:', error);
    res.status(500).json({ message: 'Server error while deleting requirement' });
  }
};