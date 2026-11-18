import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import user from "../models/userModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import { uploadFile, deleteFile, discardUploads } from "../utils/files.js";

// A picture made from the initials, for accounts created without a photo
const avatarFor = (name) => ({
  public_id: "demo-avatar",
  url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=512&background=17304d&color=ffffff&bold=true`,
});


//REGISTER (public): a new student account. Teachers are added by an admin (Add a teacher),
// so a sign-up is always a student: never a teacher, never an admin. The photo is optional.
const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, file_number, phone_number } = req.body;
  const refuse = (message) => {
    discardUploads(req);
    res.status(400);
    throw new Error(message);
  };
  if (!first_name || !last_name || !email || !password || !file_number || !phone_number) refuse("Please fill in every field");
  if (!/^\d+$/.test(String(file_number))) refuse("The file number must contain digits only");
  if (String(password).length < 8) refuse("The password must have at least 8 characters");
  if (await user.exists({ $or: [{ email }, { file_number }] })) refuse("An account with this email or file number already exists");
  const newUser = await user.create({
    first_name, last_name, email, file_number,
    phone_number: String(phone_number).replace(/\D/g, ""),
    password: await bcrypt.hash(password, 10),
    image: req.file ? await uploadFile(req.file, "mathdep/users") : avatarFor(`${first_name} ${last_name}`),
    isTeacher: false, isAdmin: false, isActive: true,
  });
  res.status(201).json({ _id: newUser.id, first_name: newUser.first_name, last_name: newUser.last_name, email: newUser.email, image: newUser.image });
});

//GET ALL USERS
// Public: what the Teaching Staff pages show, and nothing else (no emails, phone numbers, file numbers or
// passwords). Reads both user formats: 2024 (first_name, isTeacher) and 2023 (name, type: "teacher").
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await user
    .find({ $or: [{ isTeacher: true }, { type: "teacher" }], isActive: { $ne: false }, status: { $ne: false } })
    .select("first_name last_name name title description image.url")
    .lean();
  res.json({
    status: 200,
    total: teachers.length,
    data: teachers.map((teacher) => ({
      _id: teacher._id,
      name: teacher.first_name ? `${teacher.first_name} ${teacher.last_name}` : teacher.name,
      title: teacher.title || "",
      description: teacher.description || "",
      image: teacher.image?.url || "",
    })),
  });
});

const getUsers = async (req, res) => {
  try{
    const all_users = await user.find();
    const totalUsers = all_users.length; 
  res.json({
    message: `All users (${totalUsers})`,
    status: 200,
    data: all_users,
    totalUsers,
  });
}
catch (err) {
  return res.status(500).json({
    data: err
  })
}
};

//LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const loginUser = await user.findOne({ email });

  if (loginUser && (await bcrypt.compare(password, loginUser.password))) {
    if (loginUser.isActive === false) {
      res.status(403);
      throw new Error("Your account is deactivated. Please contact the secretariat.");
    }
    const token = jwt.sign({user_id : loginUser._id , email: loginUser.email, name: loginUser.name, image: loginUser.image.url}, process.env.JWT_SECRET, {expiresIn: "7d" })
    res.json({
      _id: loginUser.id,
      first_name: loginUser.first_name,
      last_name: loginUser.last_name,
      email: loginUser.email,
      image: loginUser.image.url,
      isAdmin: loginUser.isAdmin,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email Data");
  }
});

//GET ME
const getMe = asyncHandler(async (req, res) => {
  const currentUser = await user.findById(req.user.id);
  res.json({
    message: "User data retrieved successfully",
    status: 200,
    data: currentUser,
  });
});

//GET BY ID
const getUserById = asyncHandler(async (req, res) => {
  const User = await user.findById(req.params.id);

  if (User) {
    res.json({
      message: "User data retrieved",
      User,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//DELETE USER (admin): the account, its photo, its posts, and the replies it wrote or received
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === String(req.user._id)) {
    res.status(400);
    throw new Error("You can't delete your own account");
  }
  const deletedUser = await user.findByIdAndDelete(id);
  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found");
  }
  deleteFile(deletedUser.image);
  const posts = await Post.find({ user: deletedUser._id }).select("_id");
  await Comment.deleteMany({ $or: [{ user: deletedUser._id }, { post: { $in: posts.map((post) => post._id) } }] });
  await Post.deleteMany({ user: deletedUser._id });
  res.json({ message: "User deleted successfully", status: 200 });
});


//EDIT USER (admin): only the fields sent are changed; a new photo replaces the old one
const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, phone_number, isActive, description, title } = req.body;
  if (id === String(req.user._id) && (isActive === false || isActive === "false")) {
    discardUploads(req);
    res.status(400);
    throw new Error("You can't deactivate your own account");
  }
  const userToUpdate = await user.findById(id);
  if (!userToUpdate) {
    discardUploads(req);
    res.status(404);
    throw new Error("User not found");
  }
  if (first_name) userToUpdate.first_name = first_name;
  if (last_name) userToUpdate.last_name = last_name;
  if (email) userToUpdate.email = email;
  if (phone_number) userToUpdate.phone_number = phone_number;
  if (description !== undefined) userToUpdate.description = description;
  if (title !== undefined) userToUpdate.title = title;
  if (isActive !== undefined) userToUpdate.isActive = isActive === true || isActive === "true";
  if (password) userToUpdate.password = await bcrypt.hash(password, 10);
  if (req.file) {
    const old = userToUpdate.image?.toObject ? userToUpdate.image.toObject() : userToUpdate.image;
    userToUpdate.image = await uploadFile(req.file, "mathdep/users");
    deleteFile(old);
  }
  try {
    res.json({ message: "User updated successfully", status: 200, data: await userToUpdate.save() });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);   // e.g. an older account missing a required field
  }
});



// ADD STAFF (admin): a teacher shown on the Teaching staff page.
// The account gets a random password, so nobody can sign in with it until an admin resets it.
const createStaff = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, title, description } = req.body;
  if (!first_name || !last_name || !email) {
    discardUploads(req);
    res.status(400);
    throw new Error("Please add the first name, last name and email");
  }
  if (await user.exists({ email })) {
    discardUploads(req);
    res.status(400);
    throw new Error("A user with this email already exists");
  }
  const image = req.file ? await uploadFile(req.file, "mathdep/users") : avatarFor(`${first_name} ${last_name}`);
  let file_number;
  do file_number = crypto.randomInt(100000, 1000000);
  while (await user.exists({ file_number }));
  const teacher = await user.create({
    first_name, last_name, email, title, description, image,
    password: await bcrypt.hash(crypto.randomBytes(18).toString("base64url"), 10),
    isTeacher: true, isAdmin: false, isActive: true, phone_number: 0, file_number,
  });
  res.status(201).json({ message: "Teacher added", data: teacher });
});

// SET ADMIN (admin): make a user an admin, or take the role away.
// Nobody can remove their own admin role, so the site always keeps at least one admin.
const setAdmin = asyncHandler(async (req, res) => {
  const target = await user.findById(req.params.id);
  if (!target) {
    res.status(404);
    throw new Error("User not found");
  }
  const makeAdmin = req.body.isAdmin === true || req.body.isAdmin === "true";
  if (!makeAdmin && target._id.equals(req.user._id)) {
    res.status(400);
    throw new Error("You can't remove your own admin role");
  }
  await user.updateOne({ _id: target._id }, { $set: { isAdmin: makeAdmin } });
  res.json({ message: makeAdmin ? "This user is now an admin" : "The admin role was removed" });
});

export default {
  registerUser,
  loginUser,
  getUserById,
  getMe,
  deleteUser,
  editUser,
  getUsers,
  getTeachers,
  createStaff,
  setAdmin,
};
