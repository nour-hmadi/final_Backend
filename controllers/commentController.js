import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";

// Replies under approved posts. A signed-in user can reply, and the author comes from
// the login token. The author or an admin can delete a reply.

// POST /api/comments (signed in), body: { postId, description }
const postComment = asyncHandler(async (req, res) => {
  const { postId, description } = req.body;
  if (!postId || !description) {
    res.status(400);
    throw new Error("Please add the post and your reply");
  }
  const post = await Post.findOne({ _id: postId, status: true });
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const author = req.user.first_name ? `${req.user.first_name} ${req.user.last_name}` : req.user.name;
  const comment = await Comment.create({ user: req.user._id, name: author, description, post: post._id });
  res.status(201).json(comment);
});

// GET /api/comments (public): oldest first, so replies read in order
const getAllComments = asyncHandler(async (req, res) => {
  res.json(await Comment.find().sort({ createdAt: 1 }));
});

// GET /api/comments/:id (public)
const getCommentById = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  res.json(comment);
});

// DELETE /api/comments/:id (the author or an admin)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  if (!req.user.isAdmin && !comment.user.equals(req.user._id)) {
    res.status(403);
    throw new Error("You can only delete your own replies");
  }
  await comment.deleteOne();
  res.json({ message: "Comment deleted" });
});

export default { postComment, getAllComments, getCommentById, deleteComment };

