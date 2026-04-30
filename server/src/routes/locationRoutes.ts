import { Router } from "express";
import { getLocationSuggestions } from "../controllers/locationController.js";

const router = Router();

router.get("/suggest", getLocationSuggestions);

export default router;
