
import  express  from "express";
import controller from "../controllers/researchController.js";
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/').get(controller.getall);
router.route('/').post(upload.single('image'), controller.createData);
router.route('/:id').delete(controller.deleteData);
router.route('/:id').put(upload.single('image'),controller.updateData);
router.route('/:id').get(controller.getDataById);

export default router;