import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getAnalyticsOverview } from "../src/services/propertyService.js";
import { properties } from "../src/data/properties.js";

const outputDir = resolve(process.cwd(), "../client/public/api");

await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "properties.json"), JSON.stringify(properties));
await writeFile(resolve(outputDir, "analytics.json"), JSON.stringify(getAnalyticsOverview()));
