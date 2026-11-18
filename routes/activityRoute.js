import express from "express";
import controller from "../controllers/activityController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/me/top", protect, admin, controller.myTopActions);
router.get("/recent", protect, admin, controller.recent);

export default router;
