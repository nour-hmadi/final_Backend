import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";

// Students' posts. Anyone can read approved posts, a signed-in user can post,
// and an admin approves or deletes. The author always comes from the login token.

// POST /api/posts (signed in): the new post waits for an admin's approval
const postPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    res.status(400);
    throw new Error("Please add a title and a description");
  }
  const author = req.user.first_name ? `${req.user.first_name} ${req.user.last_name}` : req.user.name;
  const post = await Post.create({
    user: req.user._id,
    name: author,
    title,
    description,
    image: req.user.image?.url,   // the author's photo, shown beside the post
    status: false,
  });
  res.status(201).json(post);
});

// GET /api/posts (public): approved posts only, newest first
const getAllPosts = asyncHandler(async (req, res) => {
  res.json(await Post.find({ status: true }).sort({ createdAt: -1 }));
});

// GET /api/posts/pending (admin): posts waiting for approval
const getPendingPosts = asyncHandler(async (req, res) => {
  res.json(await Post.find({ status: false }).sort({ createdAt: -1 }));
});

// GET /api/posts/:id (public): one approved post
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: true });
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.json(post);
});

// PUT /api/posts/:id (admin): approve (status true) or hide (status false)
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  if (req.body.status !== undefined) post.status = req.body.status;
  res.json(await post.save());
});

// DELETE /api/posts/:id (admin)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.json({ message: "Post deleted" });
});

export default { postPost, getAllPosts, getPendingPosts, getPostById, updatePost, deletePost };
