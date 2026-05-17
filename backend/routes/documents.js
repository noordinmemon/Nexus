const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  shareDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/upload', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.log('=== MULTER/CLOUDINARY ERROR ===');
      console.log(err.message);
      console.log(err.stack);
      console.log(JSON.stringify(err));
      return res.status(500).json({ message: err.message });
    }
    next();
  });
}, uploadDocument);

router.get('/', protect, getMyDocuments);
router.delete('/:id', protect, deleteDocument);
router.put('/:id/share', protect, shareDocument);

module.exports = router;