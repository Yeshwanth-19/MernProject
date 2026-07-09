import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeField = file.fieldname.replace(/[^a-z0-9]/gi, '');
    cb(null, `${req.user._id}-${safeField}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Only JPG, PNG, and PDF files are allowed'));
};

export const uploadKycDocuments = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
]);
