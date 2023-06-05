import  express  from "express";
import userController from "../controllers/userController.js";
import  protect from "../middlewares/authMiddleware.js";
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();



router.route('/register').post(upload.single('image'),userController.registerUser);
router.route('/:id').get(userController.getUserById);
router.route('/login').post(upload.single('image'),userController.loginUser);
router.route('/me').get(userController.getMe);
router.route('/').get(userController.getUsers);
router.route('/edit/:id').put(userController.editUser);
router.route('/:id').delete(userController.deleteUser);


export default router;