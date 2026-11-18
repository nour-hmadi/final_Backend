import express from "express";
import controller from "../controllers/carouselController.js";
import upload from "../middlewares/upload.middleware.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", controller.getAll);   // public
router.post("/", protect, admin, upload.single("image"), controller.create);
router.put("/:id", protect, admin, upload.single("image"), controller.update);
router.delete("/:id", protect, admin, controller.remove);

export default router;
