const router = express.Router();
import express from "express";
import multer from "multer";
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from "../controllers/TeacherCardController.js";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const uploadMiddlewares = multer({
  storage,
});

router
  .route("/")
  .get(getCards)
  .post(uploadMiddlewares.single("image_url"), createCard);

router
  .route("/:id")
  .put(uploadMiddlewares.single("image_url"), updateCard)
  .delete(deleteCard)
  .get(getCardById);

export default router;
