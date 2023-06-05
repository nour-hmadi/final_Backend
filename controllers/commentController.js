import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";

//============

const postComment = asyncHandler(async (req, res) => {
 

  try {
    const userId = req.user;
    console.log("user req ",req.body)
    console.log("USER",userId)
    const { postId, description } = req.body;

    const comment =  await Comment.create({
      user: userId,
      description,
      post: postId,
    });

    res.status(201).json(comment);
 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//==============================================

const getAllComments = asyncHandler(async (req, res) => {
  const comment = await Comment.find().populate("post");
  res.json(comment);
});

//============

const getCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id).populate("post");
  console.log(id);
  res.json(comment);
});
//============
const updateComment = asyncHandler(async (req, res, next) => {
  try {
    const data = await Comment.findById(req.params.id);
    console.log(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    const { status } = req.body;

    if (status !== undefined) {
      data.status = status;
    }

    const updatedData = await data.save();
    res.json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//=============

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findByIdAndDelete(id);
  console.log(id);
  if (comment) {
    return res.status(200).json({
      message: `${id} had been deleted successfully`,
    });
  } else return res.status(404).json({ message: `${id} not found` });
});

// ============
const likeComment = asyncHandler(async (req, res) => {
  const { user, id } = req.body;

  const comment = await Comment.findById(id);
  console.log(id, comment);
  if (!comment) {
    return res.status(404).json({ message: "Like comment not found" });
  }

  // Check if the user has already liked this comment
  const index = comment.likedBy.indexOf(user);
  const liked = index !== -1;

  // Toggle the liked status
  if (liked) {
    comment.likedBy.splice(index, 1);
  } else {
    comment.likedBy.push(user);
  }

  // Update the likes count and save the comment
  comment.likesCount = comment.likedBy.length;
  await comment.save();

  // Return the comment with the new 'liked' property
  const responseComment = comment.toObject();
  responseComment.liked = !liked;
  return res.json({ comment: responseComment });
});

export default {
  getCommentById,
  likeComment,
  postComment,
  getAllComments,
  updateComment,
  deleteComment,
};
