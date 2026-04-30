import { Request, Response } from "express";
import { properties } from "../data/properties.js";

export const getAdminSummary = (_req: Request, res: Response) => {
  res.json({
    totals: {
      properties: properties.length,
      activeParsers: 1,
      successfulPayments: 38,
      reportRevenueKzt: 133000
    },
    parserJobs: [
      {
        source: "Krisha.kz",
        lastRunAt: "2026-04-16T16:00:00.000Z",
        status: "completed",
        fetched: 186,
        deduplicated: 21
      }
    ],
    queues: [
      { name: "krisha-apartments", nextRun: "Через 5 часов 22 минуты", interval: "6 часов" }
    ]
  });
};
