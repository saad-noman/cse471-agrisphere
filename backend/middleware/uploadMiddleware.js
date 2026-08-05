const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload directories
const generalUploadDir = path.join(__dirname, '../uploads');
const diseaseCaseUploadDir = path.join(__dirname, '../uploads/disease-cases');

// Create directories if they don't exist
fs.mkdirSync(generalUploadDir, { recursive: true });
fs.mkdirSync(diseaseCaseUploadDir, { recursive: true });

/* ===========================
   General Upload Storage
   =========================== */
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, generalUploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

/* ===========================
   Disease Case Storage
   =========================== */
const diseaseCaseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diseaseCaseUploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, filename);
  },
});

/* ===========================
   File Filter
   =========================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WebP images are allowed'));
  }
};

/* ===========================
   Upload Instances
   =========================== */

// Existing upload (keeps old functionality)
const upload = multer({
  storage: generalStorage,
});

// Disease case upload
const diseaseUpload = multer({
  storage: diseaseCaseStorage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = {
  upload,
  diseaseUpload,
};
