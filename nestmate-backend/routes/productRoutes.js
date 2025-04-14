const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', productController.getAllProducts); // Public: Get all products
router.get('/:id', productController.getProductById); // Public: Get a specific product
router.post('/', authMiddleware, adminMiddleware, productController.createProduct); // Admin: Create a product
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct); // Admin: Update a product
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct); // Admin: Delete a product

module.exports = router;