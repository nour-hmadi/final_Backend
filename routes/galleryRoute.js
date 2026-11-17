import express from "express";
import controller from "../controllers/galleryController.js";
import upload from "../middlewares/upload.middleware.js";
import protect from "../middlewares/authMiddleware.js";   // new
import admin from "../middlewares/adminMiddleware.js";    // new

const router = express.Router();

// Anyone can read
router.route("/").get(controller.getall);
router.route("/:d").get(controller.getDataById);

// Only admins can change
router.route("/").post(protect, admin, upload.single("image"), controller.createData);
router.route("/:id").put(protect, admin, upload.single("image"), controller.updateData);
router.route("/:id").delete(protect, admin, controller.deleteData);

export default router;
