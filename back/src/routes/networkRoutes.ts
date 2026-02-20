import { Router } from "express";
import * as networkController from "../controllers/networkController";

const router = Router();

// GET /api/networks - List all networks
router.get("/", networkController.listNetworks);

// POST /api/networks - Create network
router.post("/", networkController.createNetwork);

// GET /api/networks/:id - Get network by id
router.get("/:id", networkController.getNetwork);

// PUT /api/networks/:id - Update network
router.put("/:id", networkController.updateNetwork);

// DELETE /api/networks/:id - Delete network
router.delete("/:id", networkController.deleteNetwork);

export default router;
