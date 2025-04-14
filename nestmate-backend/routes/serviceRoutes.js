const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
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

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authMiddleware, serviceController.createService);
router.put('/:id', authMiddleware, serviceController.updateService);
router.delete('/:id', authMiddleware, serviceController.deleteService);
router.post('/upload', authMiddleware, upload.array('images', 10), serviceController.uploadPhotos);

// Contact-related routes
router.get('/:id/contacted', authMiddleware, serviceController.getContactedUsers);
router.put('/:id/contacted/:userId/confirm', authMiddleware, serviceController.confirmContactedUser);
router.delete('/:id/contacted/:userId', authMiddleware, serviceController.removeContactedUser);
router.post('/:id/contact', authMiddleware, serviceController.contactService);
module.exports = router;