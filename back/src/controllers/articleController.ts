import { Request, Response, NextFunction } from "express";
import * as articleService from "../services/articleService";
import * as notificationService from "../services/notificationService";
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  ArticleStatusSchema,
  NotifyArticleSchema,
  ArticleFilterSchema,
} from "../schemas/validation";

export async function listArticles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters = ArticleFilterSchema.parse(req.query);
    const result = await articleService.getArticles(filters);
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);
    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedData = CreateArticleSchema.parse(req.body);
    const article = await articleService.createArticle(validatedData);
    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = UpdateArticleSchema.parse(req.body);
    const article = await articleService.updateArticle(id, validatedData);
    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateArticleStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = ArticleStatusSchema.parse(req.body);
    const article = await articleService.updateArticleStatus(
      id,
      validatedData.status
    );
    res.json({
      success: true,
      message: `Article status updated to "${validatedData.status}"`,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const article = await articleService.deleteArticle(id);
    res.json({
      success: true,
      message: "Article deleted successfully",
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function notifyArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = NotifyArticleSchema.parse(req.body);

    const result = await notificationService.sendArticleNotification(
      id,
      validatedData.recipients,
      validatedData.subject
    );

    res.status(201).json({
      success: result.emailResult.success,
      message: result.emailResult.success
        ? "Notification sent successfully"
        : "Failed to send notification",
      data: {
        notification: result.notification,
        recipients: validatedData.recipients,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function importArticles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const articlesData = Array.isArray(req.body)
      ? req.body
      : [req.body];

    // Validate each article
    const validatedArticles = articlesData.map((article) =>
      CreateArticleSchema.parse(article)
    );

    const result = await articleService.importArticles(validatedArticles);

    res.status(201).json({
      success: true,
      message: `${result.count} article(s) imported successfully`,
      data: {
        imported: result.count,
        articles: result.articles,
      },
    });
  } catch (error) {
    next(error);
  }
}
