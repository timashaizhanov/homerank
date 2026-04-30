import { Router } from "express";
import {
  getAnalytics,
  getProperty,
  getReport,
  listProperties
} from "../controllers/propertyController.js";

const router = Router();

router.get("/", listProperties);
router.get("/analytics/market", getAnalytics);
router.get("/:id/report", getReport);
router.get("/:id", getProperty);

export default router;
