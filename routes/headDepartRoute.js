
import  express  from "express";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
import controller from "../controllers/headDepartController.js";
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/').get(controller.getall);
router.route('/').post(protect, admin, upload.single('image'), controller.createData);
router.route('/:id').delete(protect, admin, controller.deleteData);
router.route('/:id').put(protect, admin, upload.single('image'),controller.updateData);
router.route('/:d').get(controller.getDataById);

export default router;