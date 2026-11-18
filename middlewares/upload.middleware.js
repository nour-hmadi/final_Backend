import multer from "multer";
import path from "path";

// Saves an uploaded file in uploads/ before it goes to Cloudinary.
// A field named "pdf" accepts only a PDF; every other field accepts only an image.
// 10 MB at most, so nobody can fill the server or Cloudinary.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdfField = file.fieldname === "pdf";
    if (isPdfField ? file.mimetype === "application/pdf" : IMAGES.includes(file.mimetype)) return cb(null, true);
    const error = new Error(isPdfField ? "The document must be a PDF" : "Only JPG, PNG, WEBP or GIF images are allowed");
    error.status = 400;
    cb(error);
  },
});

export default upload;
