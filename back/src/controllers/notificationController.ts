import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notificationService";

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const notifications = await notificationService.getNotificationHistory(
      limitNum
    );
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getArticleNotifications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { articleId } = req.params;
    const notifications = await notificationService.getNotificationsByArticle(
      articleId
    );
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotification(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const notification = await notificationService.getNotificationById(id);
    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}
