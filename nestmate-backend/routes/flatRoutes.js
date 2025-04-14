const express = require('express');
const router = express.Router();
const flatController = require('../controllers/flatController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get('/', flatController.getAllFlats);
router.get('/user', authMiddleware, flatController.getUserFlats);
router.get('/:id', flatController.getFlatById);
router.post('/', authMiddleware, flatController.createFlat);
router.put('/:id', authMiddleware, flatController.updateFlat);
router.delete('/:id', authMiddleware, flatController.deleteFlat);
router.post('/upload', authMiddleware, upload.array('images', 10), flatController.uploadPhotos);
router.get('/:id/contacted', authMiddleware, flatController.getContactedUsers);
router.post('/:id/contacted/:userId/confirm', authMiddleware, flatController.confirmContactedUser);
router.delete('/:id/contacted/:userId', authMiddleware, flatController.removeContactedUser);
router.get('/:id/nearby', authMiddleware, flatController.getNearbyListings); // New route

module.exports = router;