const Flat = require('../models/Flat');
const Mess = require('../models/Mess'); 
const Service = require('../models/Service'); 
const path = require('path');
const fs = require('fs');

const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; 

  const lat1 = coords1.lat;
  const lon1 = coords1.lng;
  const lat2 = coords2.lat;
  const lon2 = coords2.lng;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distance in kilometers
};

// ... (previous imports and haversineDistance function remain)
exports.getAllFlats = async (req, res) => {
  try {
    const { search, lat, lng } = req.query;
    let query = { status: 'available' };

    if (search && search.trim()) {
      const searchTerm = search.trim();
      const regex = new RegExp(`^${searchTerm}$`, 'i');
      query = {
        ...query,
        $or: [
          { 'location.city': regex },
          { 'location.locality': regex },
          { 'location.landmark': regex },
        ],
      };
      console.log('Search Query:', JSON.stringify(query, null, 2));
    } else {
      console.log('No search term provided, returning all available flats');
    }

    let flats = await Flat.find(query).populate('postedBy', 'name email');

    if (lat && lng) {
      const poiCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
      flats = flats.map((flat) => {
        const distance = haversineDistance(poiCoords, flat.location.coordinates);
        return { ...flat.toObject(), distance };
      });
      flats.sort((a, b) => a.distance - b.distance);
      console.log(`Sorted ${flats.length} flats by distance from POI [${lat}, ${lng}]`);
    }

    console.log('Returning Flats:', flats); // Debug log
    res.json(flats);
  } catch (error) {
    console.error('Error in getAllFlats:', error);
    res.status(500).json({ message: error.message });
  }
};

// New endpoint to get nearby messes and services
exports.getNearbyListings = async (req, res) => {
  try {
    const flatId = req.params.id;
    const flat = await Flat.findById(flatId).select('location.coordinates');
    if (!flat || !flat.location.coordinates.lat || !flat.location.coordinates.lng) {
      return res.status(404).json({ message: 'Flat not found or missing coordinates' });
    }

    const flatCoords = flat.location.coordinates;

    // Fetch messes and services with coordinates
    const messes = await Mess.find({ 'location.coordinates': { $exists: true } }).select(
      'messName location.coordinates'
    );
    const services = await Service.find({ 'location.coordinates': { $exists: true } }).select(
      'name serviceType location.coordinates'
    );

    // Filter and sort messes within 1 km
    const nearbyMesses = messes
      .map((mess) => {
        const distance = haversineDistance(flatCoords, mess.location.coordinates);
        return { ...mess._doc, distance };
      })
      .filter((mess) => mess.distance <= 1)
      .sort((a, b) => a.distance - b.distance);

    // Filter and sort services within 1 km
    const nearbyServices = services
      .map((service) => {
        const distance = haversineDistance(flatCoords, service.location.coordinates);
        return { ...service._doc, distance };
      })
      .filter((service) => service.distance <= 1)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({ nearbyMesses, nearbyServices });
  } catch (error) {
    console.error('Error fetching nearby listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getFlatById = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id).populate('postedBy', 'name email phone');
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    res.json(flat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFlat = async (req, res) => {
  try {
    const flat = new Flat({ ...req.body, postedBy: req.user.id, contactedUsers: [] });
    await flat.save();
    res.status(201).json(flat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// flatController.js
exports.updateFlat = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    if (flat.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newImages = req.body.images || []; // Array of filenames
    const oldImages = flat.images || []; // Array of filenames

    // Identify images to delete (stored as filenames in DB)
    const imagesToDelete = oldImages.filter(filename => !newImages.includes(filename));
    imagesToDelete.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    Object.assign(flat, req.body, { images: newImages, updatedAt: Date.now() });
    await flat.save();
    res.json(flat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// flatController.js
exports.deleteFlat = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    if (flat.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (flat.images && Array.isArray(flat.images)) {
      flat.images.forEach(filename => {
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await Flat.deleteOne({ _id: req.params.id });
    res.json({ message: 'Flat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// flatController.js
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

exports.getUserFlats = async (req, res) => {
  try {
    const flats = await Flat.find({ postedBy: req.user.id });
    res.json(flats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContactedUsers = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    if (flat.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    console.log('Contacted Users from DB:', flat.contactedUsers);
    res.json(flat.contactedUsers || []);
  } catch (error) {
    console.error('Error in getContactedUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.confirmContactedUser = async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    if (flat.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const contact = flat.contactedUsers.find(c => c.userId.toString() === req.params.userId);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    contact.confirmed = true;
    await flat.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeContactedUser = async (req, res) => {
  const { id, userId } = req.params;
  try {
    const flat = await Flat.findById(id);
    if (!flat) return res.status(404).json({ message: 'Flat not found' });
    if (flat.postedBy.toString() !== req.user.id && userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const initialLength = flat.contactedUsers.length;
    flat.contactedUsers = flat.contactedUsers.filter(
      (c) => c.userId.toString() !== userId
    );
    
    if (flat.contactedUsers.length === initialLength) {
      return res.status(404).json({ message: 'Contact not found in contactedUsers' });
    }

    await flat.save();
    console.log('Updated Contacted Users after removal:', flat.contactedUsers);
    res.json(flat.contactedUsers);
  } catch (error) {
    console.error('Error in removeContactedUser:', error);
    res.status(500).json({ message: error.message });
  }
};