
import  express  from "express";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
import controller from "../controllers/contactController.js";
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/').get(controller.getContactUsDetails);
router.route('/').post(protect, admin, upload.single('image'), controller.createContactUsDetails);
router.route('/:id').delete(protect, admin, controller.deleteContactUsDetails);
router.route('/:id').put(protect, admin, upload.single('image'),controller.updateContactUsDetails);
router.route('/:d').get(controller.getContactUsDetailsById);

export default router;