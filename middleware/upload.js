const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;
let isCloudinary = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'sk-interior',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    },
  });
  isCloudinary = true;
  console.log('Using Cloudinary for file uploads');
} else {
  // Fallback to local disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  });
  console.log('Using local disk storage for file uploads');
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper to normalize and extract image URL (Cloudinary path or static local path)
upload.getImageUrl = (file) => {
  if (!file) return null;
  // If it's Cloudinary storage, the URL is in file.path (which starts with http/https)
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  // Otherwise, fallback to local uploads url structure
  return file.filename ? `/uploads/${file.filename}` : null;
};

// Helper to delete image from either Cloudinary or Local uploads
upload.deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Cloudinary URL deletion
    const cloudinary = require('cloudinary').v2;
    try {
      // Configure cloudinary in-place if not done globally, or rely on environment variables
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const parts = imageUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1) {
        let publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
        if (parts[uploadIndex + 1].startsWith('v') && /^\d+$/.test(parts[uploadIndex + 1].substring(1))) {
          publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
        }
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Deleted image from Cloudinary:', publicId, result);
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  } else if (imageUrl.startsWith('/uploads/')) {
    // Local static file deletion
    try {
      const filePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted local image file:', filePath);
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }
};

module.exports = upload;
