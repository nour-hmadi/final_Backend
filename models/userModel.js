import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "please add a username"],
      unique: [true, "please add a unique username"],
    },
    first_name: {
      type: String,
      required: [true, "please add your first name"],
    },
    last_name: {
      type: String,
      required: [true, "please add your last name"],
    },
    email: {
      type: String,
      required: [true, "please add your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please add a password"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "comadmin", "user"],
      default: "user",
    },
  },

  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
export default User;
