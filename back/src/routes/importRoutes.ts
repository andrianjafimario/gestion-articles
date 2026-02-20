import { Router } from "express";
import * as articleController from "../controllers/articleController";

const router = Router();

// POST /api/import/articles - Import articles from JSON
router.post("/articles", articleController.importArticles);

export default router;
