import Post from "../controllers/postController.js";
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.route("/:id").post( upload.single("image"), Post.postPost);

router.route("/").patch(protect,upload.single("image"), Post.updatePost);

router.route("/:id").delete(Post.deletePost);

router.route("/").get( Post.getAllPosts);

router.route("/:id").get( Post.getPostById);


export default router;
