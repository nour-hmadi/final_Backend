import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";
//============

const postPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const user = await User.findById(id);
  console.log("nour")
  console.log(user)
  console.log(user.name)
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  console.log(user);

  const { title, description } = req.body;
  console.log(req.body);
  if (!title || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!req.file || req.file.length === 0) {
    return res.status(400).json({ message: "Image file is missing" });
  }

  try {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    const result = await cloudinary.v2.uploader.upload(req.file.path);

    const post = new Post({
      user: user.id,
      name: user.name,
      title,
      description,
      image: result.secure_url,
    });

    await post.save();
    return res.status(200).json({
      post,
    });
  } catch (error) {
    console.error(error);
    // return res.status(500).json({ message: "Internal server error" });
  }
});

//============

const getAllPosts = asyncHandler(async (req, res) => {
  const post = await Post.find();
  res.json(post);
});

//============

const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  console.log(id);
  res.json(post);
});
//============

const updatePost = asyncHandler(async (req, res) => {
  const { user, id } = req.body;
  const useri = await User.findById(user);
  if (!useri) {
    return res.status(404).json({ message: "User not found" });
  }
  const { status } = req.body;
  // Update the post
  const updates = {
    status,
  };
  const options = { new: true };
  const post = await Post.findByIdAndUpdate(id, updates, options);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  return res.json({ post });
});

//=============

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  console.log(id);
  if (post) {
    return res.status(200).json({
      message: `${id} had been deleted successfully`,
    });
  } else return res.status(404).json({ message: `${id} not found` });
});

// ============
const likePost = asyncHandler(async (req, res) => {
  const { user, id } = req.body;

  const post = await Post.findById(id);
  console.log(id, post);
  if (!post) {
    return res.status(404).json({ message: "Like Post not found" });
  }

  // Check if the user has already liked this post
  const index = post.likedBy.indexOf(user);
  const liked = index !== -1;

  // Toggle the liked status
  if (liked) {
    post.likedBy.splice(index, 1);
  } else {
    post.likedBy.push(user);
  }

  // Update the likes count and save the post
  post.likesCount = post.likedBy.length;
  await post.save();

  // Return the post with the new 'liked' property
  const responsePost = post.toObject();
  responsePost.liked = !liked;
  return res.json({ post: responsePost });
});

// Get likes data for all posts
const getLikesData = asyncHandler(async (req, res) => {
  // Retrieve likes data for all posts
  const likesData = await Like.aggregate([
    {
      $group: {
        _id: "$post",
        likes: { $push: "$user" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Create a map of post IDs to likes data
  const likesMap = new Map();
  likesData.forEach((item) => likesMap.set(item._id.toString(), item));

  return res.json(likesMap);
});

export default {
  getPostById,
  likePost,
  getLikesData,
  postPost,
  getAllPosts,
  updatePost,
  deletePost,
};
