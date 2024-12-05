// controllers/checkFileNumberController.js
import User from '../models/userModel.js';

const checkFileNumber = async (req, res) => {
  const { file_number } = req.body;  // Extract file_number from the request body
  try {
    const existingUser = await User.findOne({ file_number });  // Check if file_number exists in the database
    if (existingUser) {
      return res.status(200).json({ exists: true });  // If found, return { exists: true }
    }
    res.status(200).json({ exists: false });  // If not found, return { exists: false }
  } catch (error) {
    console.error("Error checking file number:", error);
    res.status(500).json({ message: "Internal server error" });  // Handle server errors
  }
};

export default checkFileNumber;  // Export the controller function
