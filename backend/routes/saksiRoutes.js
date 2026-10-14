const express = require('express');
const router = express.Router();
const saksiController = require('../controllers/saksiController');
const { upload } = require('../middleware/uploadMiddleware');

// POST route with multiple file uploads (KTP Saksi 1 & Saksi 2)
router.post(
    '/', 
    upload.fields([
        { name: 'ktpSaksi1', maxCount: 1 },
        { name: 'ktpSaksi2', maxCount: 1 }
    ]), 
    saksiController.submitData
);

// Removed local GET routes for PDF since it's on Google Drive

module.exports = router;
