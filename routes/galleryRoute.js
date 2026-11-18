import express from "express";
import controller from "../controllers/galleryController.js";
import upload from "../middlewares/upload.middleware.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Anyone can look; only admins can change. protect and admin come before upload,
// so a request from someone else is refused before any file is saved.
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", protect, admin, upload.single("image"), controller.create);
router.put("/:id", protect, admin, upload.single("image"), controller.update);
router.delete("/:id", protect, admin, controller.remove);

export default router;
