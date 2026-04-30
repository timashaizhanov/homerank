import { Request, Response } from "express";
import {
  filterProperties,
  getAnalyticsOverview,
  getFiltersFromQuery,
  getPropertyById,
  getPropertyReport
} from "../services/propertyService.js";

export const listProperties = (req: Request, res: Response) => {
  const filters = getFiltersFromQuery(req.query as Record<string, string | undefined>);
  const items = filterProperties(filters);
  const pageRaw = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
  const pageSizeRaw = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;
  const page = Math.max(1, Number(pageRaw) || 1);
  const pageSize = Math.min(60, Math.max(1, Number(pageSizeRaw) || 24));
  const startIndex = (page - 1) * pageSize;
  const pagedItems = items.slice(startIndex, startIndex + pageSize);

  res.json({
    total: items.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    items: pagedItems
  });
};

export const getProperty = (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const property = getPropertyById(id);

  if (!property) {
    return res.status(404).json({ message: "Объект не найден" });
  }

  return res.json(property);
};

export const getReport = (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const report = getPropertyReport(id);

  if (!report) {
    return res.status(404).json({ message: "Отчёт не найден" });
  }

  return res.json({
    unlocked: true,
    amountKzt: 3500,
    ...report
  });
};

export const getAnalytics = (_req: Request, res: Response) => {
  res.json(getAnalyticsOverview());
};
