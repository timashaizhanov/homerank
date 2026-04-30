import type { AddressSuggestion, Coordinates, IsochroneResult, TravelMode } from "../types/domain";

declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_2GIS_API_KEY?: string;
      VITE_DGIS_API_KEY?: string;
    };
  }
}

const getApiKey = () =>
  import.meta.env.VITE_2GIS_API_KEY ||
  import.meta.env.VITE_DGIS_API_KEY ||
  window.__APP_CONFIG__?.VITE_2GIS_API_KEY ||
  window.__APP_CONFIG__?.VITE_DGIS_API_KEY ||
  "";

const SEARCH_BASE = "https://catalog.api.2gis.com/3.0/items/geocode";
const ISOCHRONE_BASE = "https://routing.api.2gis.com/isochrone/2.0.0";
const OSRM_BASE = "https://router.project-osrm.org";
const APP_API_BASE =
  import.meta.env.VITE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:4000/api`;

export const has2GisApiKey = () => Boolean(getApiKey());
export const supportsExactFallbackRouting = (transport: TravelMode) =>
  transport === "driving" || transport === "walking";

const getItems = (payload: unknown): Array<Record<string, unknown>> => {
  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const maybeItems = (payload as { result?: { items?: Array<Record<string, unknown>> }; items?: Array<Record<string, unknown>> });
  return maybeItems.result?.items ?? maybeItems.items ?? [];
};

const readPoint = (item: Record<string, unknown>): Coordinates | null => {
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

export async function fetchAddressSuggestions(query: string, city?: string): Promise<AddressSuggestion[]> {
  const url = new URL(`${APP_API_BASE}/locations/suggest`);
  url.searchParams.set("q", query);
  if (city) {
    url.searchParams.set("city", city);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Location suggest error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    items?: AddressSuggestion[];
  };

  return payload.items ?? [];
}

export async function geocodeAddress(query: string, city?: string): Promise<Coordinates | null> {
  const suggestions = await fetchAddressSuggestions(query, city);
  return suggestions[0]?.location ?? null;
}

const parseRing = (ring: string): Array<[number, number]> =>
  ring
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [lon, lat] = pair.split(/\s+/).map(Number);
      return [lon, lat] as [number, number];
    })
    .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

export const parseWktMultiPolygon = (wkt: string): Array<Array<[number, number]>> => {
  const normalized = wkt.trim();
  const body = normalized
    .replace(/^MULTIPOLYGON\s*\(\(\(/, "")
    .replace(/\)\)\)\s*$/, "");

  return body
    .split(")),((")
    .map((polygon) => polygon.split("),(")[0])
    .map(parseRing)
    .filter((ring) => ring.length >= 3);
};

export async function fetchIsochrone(
  start: Coordinates,
  transport: TravelMode,
  maxTravelMinutes: number
): Promise<IsochroneResult | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    const speedKmH =
      transport === "driving" ? 28 : transport === "public_transport" ? 22 : 5;
    const radiusKm = Math.max(0.4, (speedKmH * maxTravelMinutes) / 60);
    const radiusMeters = radiusKm * 1000;
    const earthRadiusMeters = 6_371_000;
    const polygon: Array<[number, number]> = [];

    for (let step = 0; step < 48; step += 1) {
      const bearing = (step / 48) * Math.PI * 2;
      const lat1 = (start.lat * Math.PI) / 180;
      const lon1 = (start.lon * Math.PI) / 180;
      const angularDistance = radiusMeters / earthRadiusMeters;
      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(angularDistance) +
          Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
      );
      const lon2 =
        lon1 +
        Math.atan2(
          Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
          Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
        );

      polygon.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
    }

    return {
      polygons: [polygon],
      source: start,
      durationSeconds: maxTravelMinutes * 60
    };
  }

  const response = await fetch(`${ISOCHRONE_BASE}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      start: {
        lat: start.lat,
        lon: start.lon
      },
      durations: [Math.max(1, Math.round(maxTravelMinutes * 60))],
      reverse: false,
      transport,
      detailing: 0.6
    })
  });

  if (!response.ok) {
    throw new Error(`2GIS isochrone error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    isochrones?: Array<{ duration?: number; geometry?: string }>;
  };
  const isochrone = payload.isochrones?.[0];

  if (!isochrone?.geometry) {
    return null;
  }

  return {
    polygons: parseWktMultiPolygon(isochrone.geometry),
    source: start,
    durationSeconds: isochrone.duration ?? maxTravelMinutes * 60
  };
}

export async function fetchOsrmDurations(
  start: Coordinates,
  destinations: Array<{ id: string; coordinates: [number, number] }>,
  transport: TravelMode
): Promise<Record<string, number>> {
  if (!supportsExactFallbackRouting(transport) || !destinations.length) {
    return {};
  }

  const profile = transport === "driving" ? "driving" : "foot";
  const coordinates = [
    `${start.lon},${start.lat}`,
    ...destinations.map((destination) => `${destination.coordinates[0]},${destination.coordinates[1]}`)
  ].join(";");
  const url = new URL(`${OSRM_BASE}/table/v1/${profile}/${coordinates}`);
  url.searchParams.set("sources", "0");
  url.searchParams.set("annotations", "duration");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`OSRM table error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    code?: string;
    durations?: Array<Array<number | null>>;
  };

  if (payload.code !== "Ok") {
    throw new Error(`OSRM table error: ${payload.code ?? "unknown"}`);
  }

  const durations = payload.durations?.[0] ?? [];

  return destinations.reduce<Record<string, number>>((accumulator, destination, index) => {
    const durationSeconds = durations[index + 1];

    if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds)) {
      accumulator[destination.id] = durationSeconds;
    }

    return accumulator;
  }, {});
}

export const pointInPolygon = (point: [number, number], polygon: Array<[number, number]>) => {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

export const pointInMultiPolygon = (
  point: [number, number],
  polygons: Array<Array<[number, number]>>
) => polygons.some((polygon) => pointInPolygon(point, polygon));
