import express from "express";
const router = express.Router();
import multer from "multer";
import controller from "../controllers/galleryController.js";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const uploadMiddlewares = multer({
  storage,
});

import { protect } from '../middlewares/authMiddleware.js'


router.get("/", controller.getAll); //list all
router.get("/:id", controller.get); // list one
router.post("/", uploadMiddlewares.single("image_url"), controller.post); //create
router.put("/:id", uploadMiddlewares.single("image_url"), controller.put); //update
router.delete("/:id", controller.delete); //delete

export default router;
