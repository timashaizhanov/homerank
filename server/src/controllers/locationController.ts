import { Request, Response } from "express";
import { fetchLocationSuggestions } from "../services/locationService.js";

export const getLocationSuggestions = async (req: Request, res: Response) => {
  const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const city = Array.isArray(req.query.city) ? req.query.city[0] : req.query.city;

  if (!query || typeof query !== "string" || query.trim().length < 3) {
    return res.json({
      items: []
    });
  }

  try {
    const items = await fetchLocationSuggestions(query, typeof city === "string" ? city : undefined);

    return res.json({
      items
    });
  } catch (error) {
    return res.status(502).json({
      message: error instanceof Error ? error.message : "Не удалось получить адресные подсказки"
    });
  }
};
