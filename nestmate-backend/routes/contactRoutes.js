const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, contactController.getUserContacts); // Authenticated: Get user's contacts
router.post('/', authMiddleware, contactController.createContact); // Authenticated: Create a contact message
router.put('/:id', authMiddleware, contactController.updateContact); // Authenticated: Update a contact message
router.delete('/:id', authMiddleware, contactController.deleteContact); // Authenticated: Delete a contact message

module.exports = router;