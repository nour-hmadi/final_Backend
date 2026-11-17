import express from "express";
import userController from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public
router.route("/register").post(upload.single("image"), userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/teachers").get(userController.getTeachers);

// Signed-in users (must come before "/:id", or "me" is read as an id)
router.route("/me").get(protect, userController.getMe);

// Admins only
router.route("/").get(protect, admin, userController.getUsers);
router.route("/edit/:id").put(protect, admin, upload.single("image"), userController.editUser);
router.route("/:id").get(protect, admin, userController.getUserById);
router.route("/:id").delete(protect, admin, userController.deleteUser);

export default router;
