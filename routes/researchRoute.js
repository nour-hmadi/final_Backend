import express from "express";
import controller from "../controllers/researchController.js";
import upload from "../middlewares/upload.middleware.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();
const files = upload.fields([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 }]);

router.get("/", controller.getAll);                              // public: posts that aren't hidden
router.get("/all", protect, admin, controller.getAllForAdmin);   // must come before "/:id"
router.get("/:id", controller.getById);
router.post("/", protect, admin, files, controller.create);
router.put("/:id", protect, admin, files, controller.update);
router.delete("/:id", protect, admin, controller.remove);

export default router;
