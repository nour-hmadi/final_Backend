const fs = require('fs');
const multer = require('multer');

const checkFolderAvailability = async (dir) => {
  if (!fs.existsSync(dir)) {
    await fs.mkdirSync(dir);
  }
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    checkFolderAvailability(req.body.path);
    cb(null, req.body.path);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: multerStorage });

module.exports = upload.single('file');
