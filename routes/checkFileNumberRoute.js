// routes/checkFileNumberRoute.js
import express from 'express';
import checkFileNumber from '../controllers/checkFileNumberController.js';  // Import the controller

const router = express.Router();  // Create a new router instance

// Define the POST route to check file number
router.post('/', checkFileNumber);

export default router;  // Export the router to use in server.js
