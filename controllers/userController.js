import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import user from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


//REGISTER
const registerUser = asyncHandler(async (req, res) => {

    const {
    first_name,
    last_name,
    email,
    password,
    isAdmin,
    file_number,
    phone_number,
    isActive,
    description,
    title,
    isTeacher,
  } = req.body;
  
  let image = req.file.path
 console.log(image)
  const uploadedImage = await cloudinary.uploader.upload(image); // upload the image to cloudinary
  
  const userExists = await user.findOne(
    { email } || { file_number } || { phone_number }
  );

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = await user.create({
    first_name,
    last_name,
    email,
    isAdmin: isAdmin || false,
    phone_number,
    file_number,
    isActive: isActive || true,
    isTeacher: isTeacher || true,
    description,
    title,
    password: hashedPassword,
    image: {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url
    },
  });
 

  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      first_name: newUser.first_name,
      last_name:newUser.last_name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      phone_number: newUser.phone_number,
      file_number: newUser.file_number,
      isActive: newUser.isActive,
      description: newUser.description,
      image: newUser.image && newUser.image || null,
      title: newUser.title,
      isTeacher: newUser.isTeacher,
      token: generateToken(user._id),
    });
  } else {
    if (!first_name) {
      res.status(400);
      throw new Error("Please add your first name");
    }
    if (!last_name) {
      res.status(400);
      throw new Error("Please add your last name");
    }
    if (!isTeacher) {
      res.status(400);
      throw new Error("Teacher or Student");
    }
  
    if (!email) {
      res.status(400);
      throw new Error("Please add your email");
    }
  
    if (!password) {
      res.status(400);
      throw new Error("Please add your password");
    }
  
    if (!file_number) {
      res.status(400);
      throw new Error("Please add your file number");
    }
  
    if (!phone_number) {
      res.status(400);
      throw new Error("Please add your phone number");
    }
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//GET ALL USERS
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
    const token = jwt.sign({user_id : loginUser._id , email: loginUser.email, name: loginUser.name, image: loginUser.image.url}, process.env.JWT_SECRET)
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
  console.log(req.user, 'lol');
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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await user.findByIdAndDelete(id);

  if (deletedUser) {
    res.json({
      message: "User deleted successfully",
      status: 200,
      data: deletedUser,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


//EDIT USER
const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, phone_number, isActive, description, title } = req.body;

  try {
    let image;
    let uploadedImage;

    if (req.file) {
      image = req.file.path;
      uploadedImage = await cloudinary.uploader.upload(image);
    }

    const userToUpdate = await user.findById(id);

    if (!userToUpdate) {
      res.status(404);
      throw new Error("User not found");
      return res.status(404).json({ message: "User not found" });

    }

    userToUpdate.image = uploadedImage
      ? {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        }
      : userToUpdate.image;
    userToUpdate.first_name = first_name || userToUpdate.first_name;
    userToUpdate.last_name = last_name || userToUpdate.last_name;

    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.phone_number = phone_number || userToUpdate.phone_number;
    userToUpdate.isActive = isActive !== undefined ? isActive : userToUpdate.isActive;
    userToUpdate.description = description || userToUpdate.description;
    userToUpdate.title = title || userToUpdate.title;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      userToUpdate.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await userToUpdate.save();

    res.json({
      message: "User updated successfully",
      status: 200,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);

    res.status(400).json({ message: error.message, status: 400 });
  }
});



export default {
  registerUser,
  loginUser,
  getUserById,
  getMe,
  deleteUser,
  editUser,
  getUsers,
};
