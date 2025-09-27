const path = require('path');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const uploadRoot = path.join(__dirname, '..', 'uploads', 'portfolio');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const isCsv = file.mimetype === 'text/csv'
    || file.mimetype === 'application/vnd.ms-excel'
    || file.originalname.toLowerCase().endsWith('.csv');
  if (isCsv) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload-csv', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a CSV file to upload.' });
    }

    try {
      const previewLines = [];
      const fileStream = fs.createReadStream(req.file.path);
      const reader = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      for await (const line of reader) {
        previewLines.push(line);
        if (previewLines.length >= 8) {
          reader.close();
          break;
        }
      }

      res.json({
        message: 'CSV uploaded successfully',
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        savedTo: req.file.path,
        preview: previewLines,
      });
    } catch (error) {
      next(error);
    }
  });
});

module.exports = router;