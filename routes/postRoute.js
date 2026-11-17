import express from "express";
import Post from "../controllers/postController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.route("/").get(Post.getAllPosts);                              // public: approved posts
router.route("/").post(protect, Post.postPost);                       // signed-in users
router.route("/pending").get(protect, admin, Post.getPendingPosts);   // must come before "/:id"
router.route("/:id").get(Post.getPostById);
router.route("/:id").put(protect, admin, Post.updatePost);            // approve or hide
router.route("/:id").delete(protect, admin, Post.deletePost);

export default router;
