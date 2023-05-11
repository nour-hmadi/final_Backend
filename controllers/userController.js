import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";


// Register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;


    if (!username || !email || !password) {
        res.status(400).send({ message: "Please add all fields" });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        res.status(400).send({ message: "Please enter a valid email address" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).send({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    if (!user) {
        res.status(400).send({ message: "Invalid user data" });
    }
    res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
    });

};

// Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    //check for admin email
    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(404).json({
                errors: [{ user: "not found" }],
            });
        } else {
            bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    return res.status(400).json({
                        errors: [{
                            password:
                                "incorrect"
                        }]
                    });
                } else {
                    res.json({
                        token: generateToken(user._id),
                        role: user.role,
                    })
                }
            })
        }
    })
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE,
    });
};

// LogOut
const logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out" });
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndRemove(req.params.id);

        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }

};

// get by ID
const getMe = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).send({ message: "User not found" });
    }
};

// Get All
const getAll = async (req, res) => {
    const user = await User.find();
    res.json({ message: "Admin data display", user });
};

export {
    registerUser,
    loginUser,
    getMe,
    getAll,
    deleteUser,
    logoutUser
};
