import  express  from "express";
import userController from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();



router.route('/').post(userController.registerUser);
router.route('/:id').get(userController.getUserById);
router.route('/login').post(userController.loginUser);
router.route('/me').get(userController.getMe);
router.route('/').get(userController.getUsers);
router.route('/edit/:id').put(userController.editUser);
router.route('/:id').delete(userController.deleteUser);


export default router;