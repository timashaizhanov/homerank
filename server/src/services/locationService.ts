const TWO_GIS_SEARCH_BASE = "https://catalog.api.2gis.com/3.0/items/geocode";
const NOMINATIM_SEARCH_BASE = "https://nominatim.openstreetmap.org/search";

const get2GisApiKey = () =>
  process.env.TWO_GIS_API_KEY ||
  process.env.VITE_2GIS_API_KEY ||
  process.env.DGIS_API_KEY ||
  "";

interface LocationSuggestion {
  label: string;
  location: {
    lon: number;
    lat: number;
  };
}

const readPoint = (item: Record<string, unknown>) => {
  const point = item.point as { lon?: number; lat?: number } | undefined;
  const centroid = (item.geometry as { centroid?: { lon?: number; lat?: number } } | undefined)?.centroid;
  const candidate = point ?? centroid;

  if (!candidate?.lon || !candidate?.lat) {
    return null;
  }

  return {
    lon: candidate.lon,
    lat: candidate.lat
  };
};

const readAddressLabel = (item: Record<string, unknown>) => {
  const fullAddress = item.full_address_name;
  const name = item.name;

  if (typeof fullAddress === "string" && fullAddress.trim()) {
    return fullAddress;
  }

  if (typeof name === "string" && name.trim()) {
    return name;
  }

  return "Адрес";
};

export const fetchLocationSuggestions = async (
  query: string,
  city?: string
): Promise<LocationSuggestion[]> => {
  const apiKey = get2GisApiKey();

  if (apiKey) {
    const composedQuery = city && city !== "all" ? `${query}, ${city}` : query;
    const url = new URL(TWO_GIS_SEARCH_BASE);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("locale", "ru_KZ");
    url.searchParams.set("q", composedQuery);
    url.searchParams.set("type", "building,street");
    url.searchParams.set("fields", "items.point,items.geometry.centroid,items.full_address_name");
    url.searchParams.set("page_size", "5");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`2GIS geocoder error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      result?: { items?: Array<Record<string, unknown>> };
      items?: Array<Record<string, unknown>>;
    };
    const items = payload.result?.items ?? payload.items ?? [];

    return items
      .map((item) => {
        const location = readPoint(item);

        if (!location) {
          return null;
        }

        return {
          label: readAddressLabel(item),
          location
        };
      })
      .filter(Boolean) as LocationSuggestion[];
  }

  const composedQuery =
    city && city !== "all" ? `${query}, ${city}, Казахстан` : `${query}, Казахстан`;
  const url = new URL(NOMINATIM_SEARCH_BASE);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", composedQuery);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "Qala Analytics MVP/0.1 (local development)"
    }
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap geocoder error: ${response.status}`);
  }

  const payload = (await response.json()) as Array<{
    display_name?: string;
    lon?: string;
    lat?: string;
  }>;

  return payload
    .map((item) => {
      const lon = Number(item.lon);
      const lat = Number(item.lat);

      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        return null;
      }

      return {
        label: item.display_name || "Адрес",
        location: {
          lon,
          lat
        }
      };
    })
    .filter(Boolean) as LocationSuggestion[];
};
