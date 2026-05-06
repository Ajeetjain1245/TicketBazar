import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler.js';

/**
 * Configure multer storage
 * Files are temporarily stored before uploading to Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * File filter for images
 * Only allows common image formats
 */
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpeg, jpg, png, webp, gif)', 400));
  }
};

/**
 * File filter for documents
 * Allows images and PDFs
 */
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Only images and PDF files are allowed', 400));
  }
};

/**
 * File size limits
 */
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB max file size
  files: 5, // Max 5 files per upload
};

/**
 * Upload middleware for ticket images
 */
export const uploadTicketImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits,
});

/**
 * Upload middleware for ticket proof documents
 */
export const uploadTicketProof = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
    files: 2,
  },
});

/**
 * Upload middleware for user avatars
 */
export const uploadAvatar = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
    files: 1,
  },
});

/**
 * Upload middleware for chat attachments
 */
export const uploadChatAttachment = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for chat attachments
    files: 1,
  },
});

export default {
  uploadTicketImages,
  uploadTicketProof,
  uploadAvatar,
  uploadChatAttachment,
};
