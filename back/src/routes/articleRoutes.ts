import express from "express";
import * as articleController from "../controllers/articleController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();

// Lecture : public
router.get("/", articleController.listArticles);
router.get("/:id", articleController.getArticle);

// Écriture : ADMIN ou EDITOR
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  articleController.createArticle,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  articleController.updateArticle,
);

// Suppression : ADMIN seulement
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  articleController.deleteArticle,
);

// Mise à jour du statut
router.patch(
  "/:id/status",
    articleController.updateArticleStatus
);

// Envoi de notification email pour un article
router.post(
  "/:id/notify",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  articleController.notifyArticle,
);

export default router;
