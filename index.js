// The API server: security settings, then one router per part of the site, then the error handler.
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
import morgan from "morgan";

import trackActivity from "./middlewares/activityMiddleware.js";
import sanitize from "./middlewares/sanitizeMiddleware.js";
import activityRouter from "./routes/activityRoute.js";
import contentRouter from "./routes/contentRoute.js";
import { messageRouter, subscriberRouter } from "./routes/messageRoute.js";



//import routes

import userRouter from './routes/userRoute.js';
import galleryRouter from './routes/galleryRoute.js';
import carouselRouter from './routes/carouselRoute.js';
import headdepartRouter from './routes/headDepartRoute.js';
import researchRouter from './routes/researchRoute.js';
import announcementRouter from './routes/announcementRoute.js';
import postRouter from './routes/postRoute.js';
import commentRouter from './routes/commentRoute.js';
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

//you use these inorder to use the body data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sanitize);   // no MongoDB commands hidden in the data people send (see middlewares/sanitizeMiddleware.js)
app.use(trackActivity);   // remembers each change an admin makes (see middlewares/activityMiddleware.js)

//prevent caching
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); // This prevents caching
    next();
  });
  
//Routes
app.use("/api/user", userRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/carousel", carouselRouter);
app.use("/api/headdepartment", headdepartRouter);
app.use("/api/research", researchRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/activity", activityRouter);
app.use("/api/content", contentRouter);
app.use("/api/messages", messageRouter);
app.use("/api/subscribers", subscriberRouter);



app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
