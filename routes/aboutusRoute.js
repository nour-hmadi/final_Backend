import express from "express";
import controller from "../controllers/aboutusController.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.route("/").get(controller.getData);
router.route("/").post(upload.single("image"), controller.createData);
router.route("/:id").delete(controller.deleteData);
router.route("/:id").put(upload.single("image"), controller.updateData);
router.route("/:d").get(controller.getDataById);

export default router;
