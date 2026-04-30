import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../src/data/realProperties.json");

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

const sources = [
  {
    city: "Астана",
    url: "https://krisha.kz/prodazha/kvartiry/astana/"
  },
  {
    city: "Алматы",
    url: "https://krisha.kz/prodazha/kvartiry/almaty/"
  }
];

const pagesPerCity = 4;

const cleanText = (value) =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&#8194;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parsePrice = (value) => Number(cleanText(value).replace(/[^\d]/g, ""));

const parseRoomsAndArea = (title) => {
  const roomsMatch = title.match(/(\d+)-комнат/);
  const areaMatch = title.match(/·\s*([\d.]+)\s*м²/);

  return {
    rooms: roomsMatch ? roomsMatch[1] : undefined,
    areaTotal: areaMatch ? Number(areaMatch[1]) : undefined
  };
};

const parseCardMatch = (match, city) => {
  const [, id, uuid, href, image, titleRaw, priceRaw, subtitleRaw] = match;
  const title = cleanText(titleRaw);
  const subtitle = cleanText(subtitleRaw);
  const price = parsePrice(priceRaw);
  const { rooms, areaTotal } = parseRoomsAndArea(title);
  const [districtPart, ...addressParts] = subtitle.split(",");
  const district = districtPart.trim();
  const address = addressParts.join(",").trim() || subtitle;

  return {
    id: `krisha-${id}`,
    sourceId: id,
    sourceName: "Krisha.kz",
    sourceUrl: `https://krisha.kz${href}`,
    sourcePath: href,
    sourceUuid: uuid,
    city,
    district,
    address,
    title,
    price,
    rooms,
    areaTotal,
    image,
    rawSubtitle: subtitle
  };
};

const parseListPage = async (url, city) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
      accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const cardRegex =
    /<div\s+data-id="(\d+)"[\s\S]*?data-uuid="([^"]+)"[\s\S]*?<a[\s\S]*?href="(\/a\/show\/\d+)"[\s\S]*?<img[\s\S]*?src="([^"]+)"[\s\S]*?class="a-card__title[^"]*"[^>]*>([^<]+)<\/a>[\s\S]*?class="a-card__price">\s*([\s\S]*?)<\/div>[\s\S]*?class="a-card__subtitle[^"]*"[^>]*>\s*([^<]+)\s*<\/div>/g;

  return Array.from(html.matchAll(cardRegex)).map((match) => parseCardMatch(match, city));
};

const main = async () => {
  const allCards = [];

  for (const source of sources) {
    for (let page = 1; page <= pagesPerCity; page += 1) {
      const url = page === 1 ? source.url : `${source.url}?page=${page}`;
      const cards = await parseListPage(url, source.city);
      allCards.push(...cards);
    }
  }

  const deduped = Array.from(new Map(allCards.map((item) => [item.sourceId, item])).values());

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(deduped, null, 2), "utf8");

  console.log(`Imported ${deduped.length} real listings into ${outputPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
