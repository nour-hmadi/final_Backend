import express from "express";
import rateLimit from "express-rate-limit";
import controller from "../controllers/messageController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

// Mounted twice in index.js: at /api/messages (contact messages) and /api/subscribers (newsletter)
const limit = (max) => rateLimit({
  windowMs: 60 * 60 * 1000, limit: max, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in an hour." },
});

export const messageRouter = express.Router();
messageRouter.post("/", limit(5), controller.send);                     // 5 messages an hour from one address
messageRouter.get("/", protect, admin, controller.list);
messageRouter.put("/:id", protect, admin, controller.markRead);
messageRouter.delete("/:id", protect, admin, controller.remove);

export const subscriberRouter = express.Router();
subscriberRouter.post("/", limit(10), controller.subscribe);
subscriberRouter.get("/", protect, admin, controller.subscribers);
subscriberRouter.delete("/:id", protect, admin, controller.unsubscribe);
