import express from "express";
import controller from "../controllers/contentController.js";
import upload from "../middlewares/upload.middleware.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();
const files = upload.fields([{ name: "pdf", maxCount: 1 }]);

router.get("/", controller.getEverything);                          // public: everything in one request
router.get("/settings", controller.getSettings);                    // these two come before "/:kind"
router.put("/settings", protect, admin, controller.updateSettings);
router.get("/:kind", controller.getList);
router.post("/:kind", protect, admin, files, controller.create);
router.put("/:kind/:id", protect, admin, files, controller.update);
router.delete("/:kind/:id", protect, admin, controller.remove);

export default router;
