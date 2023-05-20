import express from 'express';
const router = express.Router();
import controller from '../controllers/courseSyllabusController.js';

router.get('/', controller.getAll); //list all
router.get('/:id', controller.getByID); // list one
router.post('/', controller.post); //create 
router.put('/:id', controller.put); //update 
router.delete('/:id', controller.delete); //delete 

export default router;