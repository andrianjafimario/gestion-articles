import { Router } from "express";
import * as notificationController from "../controllers/notificationController";

const router = Router();

// GET /api/notifications - Get notification history
router.get("/", notificationController.getNotifications);

// GET /api/notifications/:id - Get notification by id
router.get("/article/:articleId", notificationController.getArticleNotifications);

// GET /api/notifications/:id - Get notification by id
router.get("/:id", notificationController.getNotification);

export default router;
