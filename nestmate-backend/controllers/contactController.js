const Contact = require('../models/Contact');
const Flat = require('../models/Flat');
const Service = require('../models/Service');
const Mess = require('../models/Mess');
const User = require('../models/User');

exports.createContact = async (req, res) => {
  const { contactedId, message, type } = req.body; 

  try {
    const contact = new Contact({
      userId: req.user.id,
      contactedId,
      message,
    });
    await contact.save();

    const user = await User.findById(req.user.id);
    const contactEntry = {
      userId: req.user.id,
      name: user.name,
      date: new Date(),
      confirmed: false,
    };

    if (type === 'flat') {
      const flat = await Flat.findOne({ postedBy: contactedId });
      if (flat && !flat.contactedUsers.some(c => c.userId.toString() === req.user.id)) {
        flat.contactedUsers.push(contactEntry);
        await flat.save();
      }
    } else if (type === 'service') {
      const service = await Service.findOne({ providerId: contactedId });
      if (service && !service.contactedUsers.some(c => c.userId.toString() === req.user.id)) {
        service.contactedUsers.push(contactEntry);
        await service.save();
      }
    } else if (type === 'mess') {
      const mess = await Mess.findOne({ providerId: contactedId });
      if (mess && !mess.contactedUsers.some(c => c.userId.toString() === req.user.id)) {
        mess.contactedUsers.push(contactEntry);
        await mess.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid contact type' });
    }

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id }).populate('contactedId', 'name');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(contact, req.body);
    contact.updatedAt = Date.now();
    await contact.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await contact.remove();
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};