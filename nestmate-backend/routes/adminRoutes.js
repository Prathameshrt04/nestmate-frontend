const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController'); // Added
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin dashboard welcome endpoint
router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

// Admin routes for viewing all resources
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/flats', authMiddleware, adminMiddleware, adminController.getAllFlats);
router.get('/services', authMiddleware, adminMiddleware, adminController.getAllServices);
router.get('/requirements', authMiddleware, adminMiddleware, adminController.getAllRequirements);
router.get('/products', authMiddleware, adminMiddleware, productController.getAllProducts); // Updated to productController
router.get('/ratings', authMiddleware, adminMiddleware, adminController.getAllRatings);
router.get('/contacts', authMiddleware, adminMiddleware, adminController.getAllContacts);

// Admin routes for user-specific listings
router.get('/users/:id/flats', authMiddleware, adminMiddleware, adminController.getUserFlats);
router.get('/users/:id/services', authMiddleware, adminMiddleware, adminController.getUserServices);
router.get('/users/:id/messes', authMiddleware, adminMiddleware, adminController.getUserMesses);
router.get('/users/:id/requirements', authMiddleware, adminMiddleware, adminController.getUserRequirements);

// Admin routes for product management
router.post('/products', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

// Admin routes for deleting resources
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);
router.delete('/flats/:id', authMiddleware, adminMiddleware, adminController.deleteFlat);
router.delete('/services/:id', authMiddleware, adminMiddleware, adminController.deleteService);
router.delete('/messes/:id', authMiddleware, adminMiddleware, adminController.deleteMess);
router.delete('/requirements/:id', authMiddleware, adminMiddleware, adminController.deleteRequirement);

module.exports = router;