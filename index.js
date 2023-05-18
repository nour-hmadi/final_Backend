// server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/errorMiddleware.js";
import teachercardRouter from "./routes/TeacherCardRoute.js";
import userRouter from './routes/userRoute.js';
import carouselRouter from './routes/carouselRoute.js'
import galleryRouter from './routes/galleryRoute.js'
import connectDB from "./config/db.js";
import contactRouter from './routes/contactRoute.js';

dotenv.config();
const port = process.env.PORT || 8000;
connectDB();
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

//you use these inorder to use the body data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/teachercard", teachercardRouter);
// app.use("/api/contact", contactRoutes);
app.use("/api/users", userRouter);
app.use("/api/carousel", carouselRouter);
app.use("/api/gallery", galleryRouter);

app.use("/api/contact", contactRouter);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
