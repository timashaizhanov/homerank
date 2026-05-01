import { Router } from "express";
import {
  getClimateData,
  getDeveloperInfo,
  getGreeneryData,
  getMarketPrices,
  getSolarData
} from "../controllers/environmentController.js";

const router = Router();

router.get("/solar", getSolarData);
router.get("/climate", getClimateData);
router.get("/greenery", getGreeneryData);
router.get("/market-prices", getMarketPrices);
router.get("/developer", getDeveloperInfo);

export default router;
