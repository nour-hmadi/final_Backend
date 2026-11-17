import express from 'express';
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
const router = express.Router();
import controller from '../controllers/courseSyllabusController.js';

router.get('/', controller.getAll); //list all
router.get('/:id', controller.getByID); // list one
router.post('/', protect, admin, controller.post); //create 
router.put('/:id', protect, admin, controller.put); //update 
router.delete('/:id', protect, admin, controller.delete); //delete 

export default router;