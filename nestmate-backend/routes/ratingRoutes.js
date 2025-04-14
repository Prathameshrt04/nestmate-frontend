const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/pending', authMiddleware, ratingController.getPendingRatings);
router.post('/pending/:targetId/ignore', authMiddleware, ratingController.ignorePendingRating);
router.get('/:type/:targetId', ratingController.getRatings); // Public: Get ratings for a flat or service
router.post('/', authMiddleware, ratingController.createRating); // Authenticated: Create a rating
router.put('/:id', authMiddleware, ratingController.updateRating); // Authenticated: Update a rating
router.delete('/:id', authMiddleware, ratingController.deleteRating); // Authenticated: Delete a rating

module.exports = router;