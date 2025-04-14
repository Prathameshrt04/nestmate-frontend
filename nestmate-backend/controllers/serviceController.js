const Service = require('../models/Service');
const User = require('../models/User'); // Add this import
const path = require('path');
const fs = require('fs');

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ status: 'active' }).populate('providerId', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'name email phone');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const serviceData = { ...req.body, providerId: req.user.id };
    const service = new Service(serviceData);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newImages = req.body.images || []; // Array of filenames
    const oldImages = service.images || []; // Array of filenames

    // Identify images to delete (stored as filenames in DB)
    const imagesToDelete = oldImages.filter(filename => !newImages.includes(filename));
    imagesToDelete.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    Object.assign(service, req.body, { images: newImages, updatedAt: Date.now() });
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (service.images && Array.isArray(service.images)) {
      service.images.forEach(filename => {
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await Service.deleteOne({ _id: req.params.id });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const imageFilenames = req.files.map(file => file.filename); // Return only filenames
    res.json({ imageFilenames });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New WhatsApp contact-related features
exports.getContactedUsers = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    console.log('Contacted Users from DB:', service.contactedUsers);
    res.json(service.contactedUsers || []);
  } catch (error) {
    console.error('Error in getContactedUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.confirmContactedUser = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const contact = service.contactedUsers.find(c => c.userId.toString() === req.params.userId);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.confirmed = true;
    await service.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeContactedUser = async (req, res) => {
  const { id, userId } = req.params;
  try {
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.providerId.toString() !== req.user.id && userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const initialLength = service.contactedUsers.length;
    service.contactedUsers = service.contactedUsers.filter(
      (c) => c.userId.toString() !== userId
    );

    if (service.contactedUsers.length === initialLength) {
      return res.status(404).json({ message: 'Contact not found in contactedUsers' });
    }

    await service.save();
    console.log('Updated Contacted Users after removal:', service.contactedUsers);
    res.json(service.contactedUsers);
  } catch (error) {
    console.error('Error in removeContactedUser:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add to the end of serviceController.js

exports.contactService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'name email phone');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (!service.providerId) return res.status(500).json({ message: 'Provider information missing' });

    if (service.providerId._id.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot contact your own service' });
    }

    const alreadyContacted = service.contactedUsers.some(c => c.userId.toString() === req.user.id);
    if (alreadyContacted) {
      return res.status(400).json({ message: 'You have already contacted this service' });
    }

    const contactingUser = await User.findById(req.user.id).select('name');
    if (!contactingUser) return res.status(500).json({ message: 'Contacting user not found' });

    service.contactedUsers.push({
      userId: req.user.id,
      name: contactingUser.name || 'Unknown', // Use fetched name
      date: Date.now(),
      confirmed: false,
    });
    await service.save();
    res.json({ message: 'Contact initiated', providerPhone: service.providerId.phone });
  } catch (error) {
    console.error('Error in contactService:', {
      error: error.message,
      stack: error.stack,
      serviceId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ message: 'Failed to initiate contact' });
  }
};