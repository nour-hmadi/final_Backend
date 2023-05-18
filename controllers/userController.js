import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import user from "../models/userModel.js";




const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    const userExists = await user.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await user.create({
        name,
        email,
        role: role || 'user',
        password: hashedPassword
    })

    if (newUser) {
        res.status(201).json({
            _id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

})


const getUsers = async (req, res) => {
    const all_users = await user.find();

    res.json({
        message: "All users",
        status: 200,
        data: all_users
    })
}


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const loginUser = await user.findOne({ email })

    if (loginUser && (await bcrypt.compare(password, loginUser.password))) {
        res.json({
            _id: loginUser.id,
            name: loginUser.name,
            email: loginUser.email,
            role: loginUser.role,
            token: generateToken(user._id)

        })
    } else {
        res.status(400)
        throw new Error('Invalid Email Data')
    }

})


const getMe = asyncHandler(async (req, res) => {
    const currentUser = await user.findById(req.user.id);

    res.json({
        message: "User data retrieved successfully",
        status: 200,
        data: currentUser,
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const User = await user.findById(req.params.id);

    if (User) {
        res.json({
            message: 'User data retrieved',
            User,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}
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
const editUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const userToUpdate = await user.findById(id);

    if (!userToUpdate) {
        res.status(404);
        throw new Error("User not found");
    }

    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;
    // userToUpdate.role = role || userToUpdate.role;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        userToUpdate.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await userToUpdate.save();

    res.json({
        message: "User updated successfully",
        status: 200,
        data: {
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: 'user',
        },
    });
});

export default 
{ 
    registerUser, 
    loginUser, 
    getUserById, 
    getMe, 
    deleteUser, 
    editUser, 
    getUsers 
}