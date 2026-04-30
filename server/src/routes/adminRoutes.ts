import { Router } from "express";
import { getAdminSummary } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/summary", requireAdmin, getAdminSummary);

export default router;
