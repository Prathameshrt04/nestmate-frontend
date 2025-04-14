const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
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

router.get('/', messController.getAllMesses);
router.get('/:id', messController.getMessById);
router.post('/', authMiddleware, messController.createMess);
router.put('/:id', authMiddleware, messController.updateMess);
router.delete('/:id', authMiddleware, messController.deleteMess);
router.post('/upload', authMiddleware, upload.array('images', 10), messController.uploadPhotos);
// Contact-related routes
router.get('/:id/contacted', authMiddleware, messController.getContactedUsers);
router.put('/:id/contacted/:userId/confirm', authMiddleware, messController.confirmContactedUser);
router.delete('/:id/contacted/:userId', authMiddleware, messController.removeContactedUser);
router.post('/:id/contact', authMiddleware, messController.contactMess);
module.exports = router;