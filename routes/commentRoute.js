import express from "express";
import Comment from "../controllers/commentController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(Comment.getAllComments);                // public
router.route("/").post(protect, Comment.postComment);         // signed-in users
router.route("/:id").get(Comment.getCommentById);
router.route("/:id").delete(protect, Comment.deleteComment);  // the author or an admin (checked inside)

export default router;
