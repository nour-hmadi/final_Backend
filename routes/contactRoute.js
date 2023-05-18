
import  express  from "express";
import controller from "../controllers/contactController.js";
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();


router.route('/').get(controller.getContactUsDetails)
router.route('/').post(upload.single('image'), controller.createContactUsDetails);
router.route('/:id').delete(controller.deleteContactUsDetails)
router.route('/:id').put(upload.single('image'),controller.updateContactUsDetails)

router.route('/:d').get(controller.getCardById)







export default router;