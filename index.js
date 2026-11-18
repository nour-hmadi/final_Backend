// server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
import morgan from "morgan";

import logRequests from "./middlewares/logRequests.js";



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
import researchRouter from './routes/researchRoute.js';
import announcementRouter from './routes/announcementRoute.js';
import postRouter from './routes/postRoute.js';
import commentRouter from './routes/commentRoute.js';
import checkFileNumberRoute from "./routes/checkFileNumberRoute.js"
dotenv.config();
const port = process.env.PORT || 8000;
connectDB();
const app = express();

app.set("trust proxy", 1);   // Render sits behind a proxy: use each visitor's real address

// Browsers may call the API only from the live site and from your laptop
const allowedOrigins = ["https://mathdep-portal.netlify.app"];
if (process.env.NODE_ENV !== "production") allowedOrigins.push(/^http:\/\/localhost:\d+$/);   // your laptop, any port
if (process.env.NODE_ENV !== "production") allowedOrigins.push(/^http:\/\/localhost:\d+$/);   // your laptop, any port
app.use(cors({ origin: allowedOrigins }));

app.use(helmet());   // security headers on every response

// At most 10 sign-in attempts per 15 minutes from one address, against password guessing
app.use("/api/user/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many sign-in attempts. Try again in 15 minutes." },
}));
app.use(morgan("dev")); // Logs incoming requests
app.use(logRequests); // Apply logging middleware here

//you use these inorder to use the body data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//prevent caching
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); // This prevents caching
    next();
  });
  
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
app.use("/api/research", researchRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use('/api/user/check-file-number', checkFileNumberRoute);



app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
