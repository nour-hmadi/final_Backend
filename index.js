// server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
//import routes
import contactRouter from './routes/contactRoute.js';
import userRouter from './routes/userRoute.js';
import aboutusRouter from './routes/aboutusRoute.js';
import coursesyllabusRouter from './routes/courseSyllabusRoute.js';
import doyouknowRouter from './routes/doYouKnowRoute.js';
import galleryRouter from './routes/galleryRoute.js';
import carouselRouter from './routes/carouselRoute.js';
import headdepartRouter from './routes/headDepartRoute.js';
import workhrsRouter from './routes/workingHoursRoute.js';

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

//Routes
app.use("/api/contact", contactRouter);
app.use("/api/user", userRouter);
app.use("/api/aboutus", aboutusRouter);
app.use("/api/coursesyllabus", coursesyllabusRouter);
app.use("/api/doyouknow", doyouknowRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/carousel", carouselRouter);
app.use("/api/headdepartment", headdepartRouter);
app.use("/api/workinghours", workhrsRouter);

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
