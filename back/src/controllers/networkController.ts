import { Request, Response, NextFunction } from "express";
import * as networkService from "../services/networkService";
import { CreateNetworkSchema, UpdateNetworkSchema } from "../schemas/validation";

export async function listNetworks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const networks = await networkService.getAllNetworks();
    res.json({
      success: true,
      data: networks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNetwork(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const network = await networkService.getNetworkById(id);
    res.json({
      success: true,
      data: network,
    });
  } catch (error) {
    next(error);
  }
}

export async function createNetwork(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedData = CreateNetworkSchema.parse(req.body);
    const network = await networkService.createNetwork(validatedData);
    res.status(201).json({
      success: true,
      data: network,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateNetwork(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = UpdateNetworkSchema.parse(req.body);
    const network = await networkService.updateNetwork(id, validatedData);
    res.json({
      success: true,
      data: network,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteNetwork(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const network = await networkService.deleteNetwork(id);
    res.json({
      success: true,
      message: "Network deleted successfully",
      data: network,
    });
  } catch (error) {
    next(error);
  }
}
