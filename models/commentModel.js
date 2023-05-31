import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  
    description: {
      type: String,
      required: true,
    },
    
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
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

const Recipe = mongoose.model("Recipe", recipeSchema);
Recipe.find()
  .populate({ path: "categoryID", select: "title" })
 

export default Recipe;