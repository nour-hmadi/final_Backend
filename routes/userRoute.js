import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getAll,
  deleteUser,
  logoutUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/delete/:id").delete(deleteUser);
router.get("/getall", getAll);
router.get("/me/:id", getMe);

export default router;
