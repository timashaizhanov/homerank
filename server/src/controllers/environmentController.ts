import { Request, Response } from "express";
import {
  fetchClimateData,
  fetchDeveloperInfo,
  fetchGreeneryData,
  fetchMarketPrices,
  fetchSolarData
} from "../services/environmentService.js";

export const getSolarData = async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ message: "Параметры lat и lon обязательны" });
  }

  try {
    const data = await fetchSolarData(lat, lon);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ message: "Ошибка получения данных PVGIS", error: String(error) });
  }
};

export const getClimateData = async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ message: "Параметры lat и lon обязательны" });
  }

  try {
    const data = await fetchClimateData(lat, lon);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ message: "Ошибка получения климатических данных", error: String(error) });
  }
};

export const getGreeneryData = async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ message: "Параметры lat и lon обязательны" });
  }

  try {
    const data = await fetchGreeneryData(lat, lon);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ message: "Ошибка получения данных о зелени", error: String(error) });
  }
};

export const getMarketPrices = async (req: Request, res: Response) => {
  const city = String(req.query.city ?? "");

  if (!city) {
    return res.status(400).json({ message: "Параметр city обязателен" });
  }

  try {
    const data = await fetchMarketPrices(city);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ message: "Ошибка получения рыночных цен", error: String(error) });
  }
};

export const getDeveloperInfo = async (req: Request, res: Response) => {
  const address = String(req.query.address ?? "");
  const city = String(req.query.city ?? "");

  if (!address || !city) {
    return res.status(400).json({ message: "Параметры address и city обязательны" });
  }

  try {
    const data = await fetchDeveloperInfo(address, city);
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ message: "Ошибка получения данных застройщика", error: String(error) });
  }
};
