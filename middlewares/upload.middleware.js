import multer from "multer";
import path from "path";

// Saves an uploaded image in uploads/ before it goes to Cloudinary.
// Images only, 5 MB at most, so nobody can fill the server or Cloudinary with other files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    const error = new Error("Only JPG, PNG, WEBP or GIF images are allowed");
    error.status = 400;
    cb(error);
  },
});

export default upload;
