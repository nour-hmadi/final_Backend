import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name:{
      type:String
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      // required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },

    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: {
      type: Number,
      default: 0,
    },
    liked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);


export default Post;
