import Comment from "../controllers/commentController.js";
import express from "express";
import  protect  from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, Comment.postComment);


router.route("/:id").put(Comment.updateComment);

router.route("/:id").delete(Comment.deleteComment);

router.route("/").get( Comment.getAllComments);

router.route("/:id").get( Comment.getCommentById);


export default router;
