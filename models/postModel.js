import mongoose, { Schema } from "mongoose";

const postSchema = mongoose.Schema(
  {
    question: {
      type: String,
      default: "Do you know That...",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "who's posting"],
    },
    status: {
      type: Boolean,
      required: false,
    },
  },
  {
    collection: "posts",
    timestamps: true,
  }
);

const Post = mongoose.model("posts", postSchema);
export default Post;
