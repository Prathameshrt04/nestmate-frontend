const User = require('../models/User');
const Flat = require('../models/Flat');
const Service = require('../models/Service');
const Requirement = require('../models/Requirement');
const Product = require('../models/Product');
const Rating = require('../models/Rating');
const Contact = require('../models/Contact');
const Mess = require('../models/Mess'); 

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFlats = async (req, res) => {
  try {
    const flats = await Flat.find().populate('flatId', 'name email');
    res.json(flats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('providerId', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find().populate('userId', 'name email');
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().populate('userId', 'name');
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().populate('userId contactedId', 'name');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserFlats = async (req, res) => {
  try {
    const flats = await Flat.find({ postedBy: req.params.id });
    res.json(flats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserServices = async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.params.id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserMesses = async (req, res) => {
  try {
    const messes = await Mess.find({ providerId: req.params.id });
    res.json(messes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ userId: req.params.id });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete associated data
    await Flat.deleteMany({ postedBy: user._id }); 
    await Service.deleteMany({ providerId: user._id });
    await Mess.deleteMany({ providerId: user._id });
    await Requirement.deleteMany({ userId: user._id });
    await Rating.deleteMany({ userId: user._id });
    await Contact.deleteMany({ $or: [{ userId: user._id }, { contactedId: user._id }] });
    await User.deleteOne({ _id: user._id });

    res.json({ message: 'User and associated data deleted' });
  } catch (error) {
    console.error('Error deleting user:', error); // Log error for debugging
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFlat = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    await Rating.deleteMany({ flatId: flat._id }); // Verify flatId in Rating schema
    await Contact.deleteMany({ contactedId: flat.flatId }); // Verify contactedId in Contact schema
    await Flat.deleteOne({ _id: flat._id });
    res.json({ message: 'Flat deleted' });
  } catch (error) {
    console.error('Error deleting flat:', error); // Log error for debugging
    res.status(500).json({ message: error.message });
  }
};


exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await Rating.deleteMany({ serviceId: service._id });
    await Contact.deleteMany({ contactedId: service.providerId });
    await Service.deleteOne({ _id: service._id });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    await Rating.deleteMany({ messId: mess._id });
    await Contact.deleteMany({ contactedId: mess.providerId });
    await Mess.deleteOne({ _id: mess._id });
    res.json({ message: 'Mess deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
    await Requirement.deleteOne({ _id: requirement._id });
    res.json({ message: 'Requirement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};