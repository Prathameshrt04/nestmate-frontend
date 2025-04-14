const Mess = require('../models/Mess');
const User = require('../models/User'); // Add this import
const path = require('path');
const fs = require('fs');

exports.getAllMesses = async (req, res) => {
  try {
    const messes = await Mess.find({ status: 'active' }).populate('providerId', 'name email');
    res.json(messes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessById = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id).populate('providerId', 'name email phone');
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMess = async (req, res) => {
  try {
    const messData = { ...req.body, providerId: req.user.id };
    const mess = new Mess(messData);
    await mess.save();
    res.status(201).json(mess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    if (mess.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newImages = req.body.images || []; // Array of filenames
    const oldImages = mess.images || []; // Array of filenames

    // Identify images to delete (stored as filenames in DB)
    const imagesToDelete = oldImages.filter(filename => !newImages.includes(filename));
    imagesToDelete.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    Object.assign(mess, req.body, { images: newImages });
    await mess.save();
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    if (mess.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (mess.images && Array.isArray(mess.images)) {
      mess.images.forEach(filename => {
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await Mess.deleteOne({ _id: req.params.id });
    res.json({ message: 'Mess deleted' });
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
    const mess = await Mess.findById(req.params.id);
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    if (mess.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    console.log('Contacted Users from DB:', mess.contactedUsers);
    res.json(mess.contactedUsers || []);
  } catch (error) {
    console.error('Error in getContactedUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.confirmContactedUser = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    if (mess.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const contact = mess.contactedUsers.find(c => c.userId.toString() === req.params.userId);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.confirmed = true;
    await mess.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeContactedUser = async (req, res) => {
  const { id, userId } = req.params;
  try {
    const mess = await Mess.findById(id);
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    if (mess.providerId.toString() !== req.user.id && userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const initialLength = mess.contactedUsers.length;
    mess.contactedUsers = mess.contactedUsers.filter(
      (c) => c.userId.toString() !== userId
    );

    if (mess.contactedUsers.length === initialLength) {
      return res.status(404).json({ message: 'Contact not found in contactedUsers' });
    }

    await mess.save();
    console.log('Updated Contacted Users after removal:', mess.contactedUsers);
    res.json(mess.contactedUsers);
  } catch (error) {
    console.error('Error in removeContactedUser:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add to the end of messController.js


exports.contactMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id).populate('providerId', 'name email phone');
    if (!mess) return res.status(404).json({ message: 'Mess not found' });
    if (!mess.providerId) return res.status(500).json({ message: 'Provider information missing' });

    if (mess.providerId._id.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot contact your own mess' });
    }

    const alreadyContacted = mess.contactedUsers.some(c => c.userId.toString() === req.user.id);
    if (alreadyContacted) {
      return res.status(400).json({ message: 'You have already contacted this mess' });
    }

    const contactingUser = await User.findById(req.user.id).select('name');
    if (!contactingUser) return res.status(500).json({ message: 'Contacting user not found' });

    mess.contactedUsers.push({
      userId: req.user.id,
      name: contactingUser.name || 'Unknown', // Use fetched name
      date: Date.now(),
      confirmed: false,
    });
    await mess.save();
    res.json({ message: 'Contact initiated', providerPhone: mess.providerId.phone });
  } catch (error) {
    console.error('Error in contactMess:', {
      error: error.message,
      stack: error.stack,
      messId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ message: 'Failed to initiate contact' });
  }
};