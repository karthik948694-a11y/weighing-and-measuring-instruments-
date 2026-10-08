const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

function imageFilter(_req, file, cb) {
  const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
  const isImageExt = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(file.originalname || '');
  if (!isImageMime && !isImageExt) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { upload };
