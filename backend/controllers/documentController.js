const Document = require('../models/Document');
const { cloudinary } = require('../config/cloudinary');

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const document = await Document.create({
      name: req.body.name || req.file.originalname,
      url: fileUrl,
      publicId: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.log('Upload error:', error.message);
    res.status(500).json({ message: error.message });
  }
}; // Get my documents
exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      uploadedBy: req.user.id
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.publicId, {
      resource_type: 'raw'
    });

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share document with user
exports.shareDocument = async (req, res) => {
  try {
    const { userId } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!document.sharedWith.includes(userId)) {
      document.sharedWith.push(userId);
      await document.save();
    }

    res.json({ message: 'Document shared successfully', document });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};