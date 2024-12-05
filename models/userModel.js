import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    type:{
      type: String,
      required: [true, "please specify if you're a teacher or a student"],
    },
    email: {
      type: String,
      required: [true, "Please add your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phone_number: {
      type: Number,
      required: [true, "please add your phone number"],
    },
    file_number: {
      type: Number,
      required: [true, "Please add your file number"],
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: "false",
      
    },
    isActive: {
      type: Boolean,
      default: 1,
    },

    description: {
      type: String,
    },
    title: {
      type: String,
    },

    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
