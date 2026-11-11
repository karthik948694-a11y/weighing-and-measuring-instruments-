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

function mediaFilter(_req, file, cb) {
  const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
  const isVideoMime = file.mimetype && file.mimetype.startsWith('video/');
  const isImageExt = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(file.originalname || '');
  const isVideoExt = /\.(mp4|webm|ogg|mov|m4v|mkv|avi|3gp)$/i.test(file.originalname || '');

  if (isImageMime || isVideoMime || isImageExt || isVideoExt) {
    return cb(null, true);
  }
  return cb(new Error('Only photo image files and video files are permitted'));
}

// 50MB limit to comfortably allow short demonstration / calibration video clips
const upload = multer({
  storage,
  fileFilter: mediaFilter,
  // Limit uploads to 16 MB as per requirement
  limits: { fileSize: 16 * 1024 * 1024 },
});

// For application submission: handles both 'photo' and 'video'
const uploadAppMedia = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

module.exports = {
  upload,
  uploadAppMedia,
};
