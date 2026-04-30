import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Pane,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";
import L, { divIcon, latLngBounds } from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { Coordinates, Property } from "../../types/domain";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { getSafetyProfile } from "../../lib/safety";

interface MapPanelProps {
  properties: Property[];
  isochronePolygons?: Array<Array<[number, number]>>;
  isochroneSource?: Coordinates | null;
  showSafetyLayer?: boolean;
}

const fallbackCenter: [number, number] = [51.13, 71.43];

const selectedMarkerIcon = divIcon({
  className: "",
  html: `
    <div style="position:relative;width:28px;height:28px">
      <div style="position:absolute;inset:0;border-radius:999px;background:rgba(255,209,102,0.28);border:2px solid #ffd166"></div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:999px;background:#c2410c;border:3px solid #ffffff"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

type SafetyZone = {
  key: string;
  city: string;
  district: string;
  center: [number, number];
  count: number;
  score: number;
  label: string;
  color: string;
};

function FitBoundsController({
  properties,
  isochronePolygons,
  isochroneSource
}: Required<Pick<MapPanelProps, "properties" | "isochronePolygons" | "isochroneSource">>) {
  const map = useMap();

  useEffect(() => {
    const points: Array<[number, number]> = [
      ...properties.map((property) => [property.coordinates[1], property.coordinates[0]] as [number, number]),
      ...isochronePolygons.flat().map(([lon, lat]) => [lat, lon] as [number, number]),
      ...(isochroneSource ? [[isochroneSource.lat, isochroneSource.lon] as [number, number]] : [])
    ];

    if (!points.length) {
      map.setView(fallbackCenter, 11, { animate: true });
      return;
    }

    const bounds = latLngBounds(points);
    map.fitBounds(bounds as LatLngBoundsExpression, {
      padding: [36, 36],
      maxZoom: 15
    });
  }, [isochronePolygons, isochroneSource, map, properties]);

  return null;
}

export function MapPanel({
  properties,
  isochronePolygons = [],
  isochroneSource = null,
  showSafetyLayer = true
}: MapPanelProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(properties[0]?.id ?? null);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? properties[0] ?? null,
    [properties, selectedPropertyId]
  );

  useEffect(() => {
    if (!selectedProperty && properties[0]) {
      setSelectedPropertyId(properties[0].id);
      return;
    }

    if (selectedPropertyId && !properties.some((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(properties[0]?.id ?? null);
    }
  }, [properties, selectedProperty, selectedPropertyId]);

  const visibleProperties = properties.slice(0, 6);
  const safetyZones = useMemo(() => {
    const grouped = new Map<string, { properties: Property[]; lon: number; lat: number }>();

    properties.forEach((property) => {
      const key = `${property.city}:${property.district}`;
      const group = grouped.get(key) ?? { properties: [], lon: 0, lat: 0 };
      group.properties.push(property);
      group.lon += property.coordinates[0];
      group.lat += property.coordinates[1];
      grouped.set(key, group);
    });

    return Array.from(grouped.entries()).map(([key, group]): SafetyZone => {
      const reference = group.properties[0];
      const safety = getSafetyProfile(reference);

      return {
        key,
        city: reference.city,
        district: reference.district,
        center: [group.lat / group.properties.length, group.lon / group.properties.length],
        count: group.properties.length,
        score: safety.score,
        label: safety.label,
        color: safety.mapColor
      };
    });
  }, [properties]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#102a43] via-[#0d1b2a] to-[#17324d] p-5 text-white shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Карта каталога</p>
          <h3 className="mt-1 font-heading text-xl font-bold">Интерактивная карта объектов</h3>
        </div>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
          OpenStreetMap · Leaflet · стабильный режим
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="relative min-h-[460px] overflow-hidden rounded-[1.75rem] border border-white/10">
          <MapContainer
            center={fallbackCenter}
            zoom={11}
            scrollWheelZoom
            className="absolute inset-0 z-0 h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Pane name="isochrone" style={{ zIndex: 350 }} />
            <Pane name="safety" style={{ zIndex: 360 }} />
            <Pane name="markers" style={{ zIndex: 450 }} />
            <Pane name="selected-marker" style={{ zIndex: 550 }} />

            <FitBoundsController
              properties={properties}
              isochronePolygons={isochronePolygons}
              isochroneSource={isochroneSource}
            />

            {isochronePolygons.map((polygon, index) => (
              <Polygon
                key={`iso-${index}`}
                positions={polygon.map(([lon, lat]) => [lat, lon])}
                pathOptions={{
                  pane: "isochrone",
                  color: "#d4a017",
                  fillColor: "#d4a017",
                  fillOpacity: 0.18,
                  weight: 2
                }}
              />
            ))}

            {showSafetyLayer ? safetyZones.map((zone) => (
              <Circle
                key={zone.key}
                center={zone.center}
                radius={950 + Math.max(0, 86 - zone.score) * 55 + Math.min(zone.count, 18) * 25}
                pathOptions={{
                  pane: "safety",
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: zone.score >= 80 ? 0.08 : zone.score >= 70 ? 0.1 : 0.13,
                  opacity: 0.5,
                  weight: 1
                }}
              >
                <Tooltip direction="top" opacity={0.95}>
                  {zone.district}: среда {zone.label.toLowerCase()}
                </Tooltip>
              </Circle>
            )) : null}

            {isochroneSource ? (
              <CircleMarker
                center={[isochroneSource.lat, isochroneSource.lon]}
                radius={7}
                pathOptions={{
                  pane: "selected-marker",
                  color: "#ffffff",
                  fillColor: "#102a43",
                  fillOpacity: 1,
                  weight: 3
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  Место работы
                </Tooltip>
              </CircleMarker>
            ) : null}

            {properties.map((property) => {
              const isSelected = property.id === selectedProperty?.id;

              if (isSelected) {
                return (
                  <Marker
                    key={property.id}
                    position={[property.coordinates[1], property.coordinates[0]]}
                    icon={selectedMarkerIcon}
                    pane="selected-marker"
                    eventHandlers={{
                      click: () => setSelectedPropertyId(property.id)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <p className="font-semibold text-ink">{property.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{property.district}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Среда района: {getSafetyProfile(property).label}
                        </p>
                        <p className="mt-2 text-sm font-bold">{formatCurrency(property.price)}</p>
                        <a
                          href={`/properties/${property.id}`}
                          className="mt-3 inline-flex rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white"
                        >
                          Открыть карточку
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              }

              return (
                <CircleMarker
                  key={property.id}
                  center={[property.coordinates[1], property.coordinates[0]]}
                  radius={7}
                  pathOptions={{
                    pane: "markers",
                    color: "#ffd166",
                    fillColor: "#102a43",
                    fillOpacity: 1,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedPropertyId(property.id)
                  }}
                >
                  <Popup>
                    <div className="min-w-[220px]">
                      <p className="font-semibold text-ink">{property.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{property.district}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Среда района: {getSafetyProfile(property).label}
                      </p>
                      <p className="mt-2 text-sm font-bold">{formatCurrency(property.price)}</p>
                      <a
                        href={`/properties/${property.id}`}
                        className="mt-3 inline-flex rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white"
                      >
                        Открыть карточку
                      </a>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {!properties.length ? (
            <div className="absolute inset-0 z-[600] flex items-center justify-center bg-ink/70 p-6 text-center text-sm text-slate-200">
              По текущим фильтрам объектов на карте нет.
            </div>
          ) : null}

          <div className="absolute bottom-4 left-4 z-[600] rounded-2xl bg-ink/75 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Слои карты</p>
            <p className="mt-2 text-sm text-slate-100">
              {isochronePolygons.length
                ? "Зона времени до работы показана поверх карты и участвует в фильтрации."
                : "Выберите адрес работы и время в пути, чтобы увидеть доступную зону на карте."}
            </p>
            {showSafetyLayer ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> спокойнее
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> сбалансированно
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> оживлённее
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {selectedProperty ? (
            <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
              <p className="text-sm text-slate-300">{selectedProperty.district}</p>
              <p className="mt-1 font-semibold">{selectedProperty.title}</p>
              <p className="mt-2 text-lg font-bold">{formatCurrency(selectedProperty.price)}</p>
              <p className="mt-1 text-sm text-slate-300">
                Среда района: {getSafetyProfile(selectedProperty).label}
              </p>
              <p className="text-sm text-slate-300">
                {selectedProperty.rooms} комн. · {formatNumber(selectedProperty.areaTotal)} м² ·{" "}
                {formatNumber(selectedProperty.pricePerSqm)} ₸/м²
              </p>
              <p className="mt-2 text-sm text-slate-300">{selectedProperty.address}</p>
              <a
                href={`/properties/${selectedProperty.id}`}
                className="mt-4 inline-flex rounded-full bg-amber px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#ffd87b]"
              >
                Открыть карточку
              </a>
            </div>
          ) : null}

          {visibleProperties.map((property) => (
            <button
              key={property.id}
              type="button"
              className={`block w-full rounded-3xl border p-4 text-left transition ${
                property.id === selectedProperty?.id
                  ? "border-amber bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              }`}
              onClick={() => setSelectedPropertyId(property.id)}
            >
              <p className="text-sm text-slate-300">{property.district}</p>
              <p className="mt-1 font-semibold">{property.title}</p>
              <p className="mt-2 text-lg font-bold">{formatCurrency(property.price)}</p>
              <p className="mt-1 text-sm text-slate-300">
                Среда: {getSafetyProfile(property).label}
              </p>
              <p className="text-sm text-slate-300">
                {property.rooms} комн. · {formatNumber(property.areaTotal)} м²
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
