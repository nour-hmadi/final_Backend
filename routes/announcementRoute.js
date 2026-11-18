import express from "express";
import controller from "../controllers/announcementController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", controller.getAll);                              // public: what is on the site today
router.get("/all", protect, admin, controller.getAllForAdmin);   // must come before "/:id"
router.get("/:id", controller.getById);
router.post("/", protect, admin, controller.create);
router.put("/:id", protect, admin, controller.update);
router.delete("/:id", protect, admin, controller.remove);

export default router;
