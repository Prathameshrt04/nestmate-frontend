const express = require('express');
const router = express.Router();
const requirementController = require('../controllers/requirementController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes for requirements
router.get('/', authMiddleware, requirementController.getUserRequirements); // Get user's requirements (protected)
router.get('/all', requirementController.getAllRequirements); // Get all requirements (public)
router.post('/', authMiddleware, requirementController.createRequirement); // Create a new requirement (protected)
router.put('/:id', authMiddleware, requirementController.updateRequirement); // Update a requirement (protected)
router.delete('/:id', authMiddleware, requirementController.deleteRequirement); // Delete a requirement (protected)

module.exports = router;