import { readFileSync } from "node:fs";
import { Property } from "../types/domain.js";

const realProperties = JSON.parse(
  readFileSync(new URL("./realProperties.json", import.meta.url), "utf8")
) as Array<{
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  city: "Астана" | "Алматы";
  district: string;
  address: string;
  title: string;
  price: number;
  rooms?: string;
  areaTotal?: number;
  image?: string | null;
}>;

const apartmentImages = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
];

const districtCatalog = {
  Астана: [
    { name: "Есиль", lat: 51.1284, lng: 71.4302, basePriceSqm: 550000, score: 8.8 },
    { name: "Алматинский", lat: 51.0917, lng: 71.4671, basePriceSqm: 430000, score: 7.6 },
    { name: "Сарыарка", lat: 51.1694, lng: 71.4048, basePriceSqm: 395000, score: 7.1 },
    { name: "Нура", lat: 51.1093, lng: 71.4012, basePriceSqm: 510000, score: 8.2 }
  ],
  Алматы: [
    { name: "Бостандыкский", lat: 43.2178, lng: 76.9401, basePriceSqm: 690000, score: 9.2 },
    { name: "Медеуский", lat: 43.2382, lng: 76.9656, basePriceSqm: 730000, score: 9.4 },
    { name: "Алмалинский", lat: 43.2565, lng: 76.9284, basePriceSqm: 610000, score: 8.6 },
    { name: "Ауэзовский", lat: 43.2221, lng: 76.8413, basePriceSqm: 500000, score: 7.9 }
  ]
} as const;

const buildingTypes = ["Монолит", "Панель", "Кирпич", "Блок"] as const;
const conditions = ["Косметический", "Евроремонт", "Дизайнерский", "Чистовая отделка"] as const;
const marketTypes = ["Первичный", "Вторичный"] as const;
const roomOptions = ["1", "2", "3", "4", "5+"] as const;
const streets = [
  "Сыганак",
  "Аль-Фараби",
  "Туран",
  "Мангилик Ел",
  "Кунаева",
  "Сатпаева",
  "Абая",
  "Кабанбай батыра",
  "Толе би",
  "Навои"
];

const monthLabels6 = ["Ноя", "Дек", "Янв", "Фев", "Мар", "Апр"];
const monthLabels12 = ["Май", "Июн", "Июл", "Авг", "Сен", "Окт", ...monthLabels6];

const featuredProperties: Property[] = [
  {
    id: "astana-esil-3-room",
    slug: "astana-esil-3-room-river-park",
    title: "3-комнатная квартира в River Park Residence",
    category: "residential",
    propertyType: "Квартира",
    operation: "sale",
    city: "Астана",
    district: "Есиль",
    address: "ул. Сыганак, район Green Mall",
    coordinates: [71.4302, 51.1284],
    price: 48500000,
    currency: "KZT",
    pricePerSqm: 556000,
    areaTotal: 87.2,
    areaLiving: 48.5,
    areaKitchen: 14.1,
    rooms: "3",
    floor: 8,
    floorsTotal: 16,
    yearBuilt: 2021,
    buildingType: "Монолит",
    marketType: "Первичный",
    condition: "Евроремонт",
    features: ["Подземный паркинг", "Закрытый двор", "Панорамные окна"],
    images: apartmentImages.slice(0, 3),
    badges: ["Новостройка", "Горячее предложение"],
    nearbyCount: 42,
    distanceToTransitKm: 0.4,
    districtScore: 8.8,
    sourceName: "Krisha.kz",
    sourceUrl: "https://krisha.kz",
    publishedAt: "2026-04-15T09:30:00.000Z",
    description:
      "Квартира для семьи или инвестора в активно растущем районе левого берега. Вид на парк, готова к сделке.",
    seller: {
      name: "Айбек С.",
      phone: "+7 701 123 45 67",
      agency: "Prime Realty Astana"
    },
    details: {
      balcony: "Застеклён",
      parking: "Подземная",
      furniture: "Частично",
      appliances: true,
      internet: true,
      bathroomType: "2 и более",
      ceilingHeight: 3,
      security: "Охрана и консьерж",
      elevator: "Пассажирский + грузовой",
      view: ["Во двор", "На улицу"]
    },
    analytics: {
      priceTrend6m: [
        { month: "Ноя", value: 518000 },
        { month: "Дек", value: 523000 },
        { month: "Янв", value: 531000 },
        { month: "Фев", value: 540000 },
        { month: "Мар", value: 548000 },
        { month: "Апр", value: 556000 }
      ],
      priceTrend12m: [
        { month: "Май", value: 492000 },
        { month: "Июн", value: 496000 },
        { month: "Июл", value: 501000 },
        { month: "Авг", value: 508000 },
        { month: "Сен", value: 512000 },
        { month: "Окт", value: 516000 },
        { month: "Ноя", value: 518000 },
        { month: "Дек", value: 523000 },
        { month: "Янв", value: 531000 },
        { month: "Фев", value: 540000 },
        { month: "Мар", value: 548000 },
        { month: "Апр", value: 556000 }
      ],
      rentYield: 7.9,
      capRate: 6.4,
      roi1y: 9.2,
      roi3y: 27.4,
      roi5y: 49.8,
      depositComparison:
        "Ожидаемая совокупная доходность на 5 лет выше депозита на 13.6 п.п. при умеренном сценарии.",
      liquidity: "Высокая",
      exposureDays: 31,
      comparables: [
        {
          id: "comp-1",
          title: "ЖК Capital Avenue, 85 м²",
          price: 47200000,
          pricePerSqm: 555294,
          area: 85,
          distanceKm: 0.6
        },
        {
          id: "comp-2",
          title: "ЖК Arman Kala, 90 м²",
          price: 49800000,
          pricePerSqm: 553333,
          area: 90,
          distanceKm: 0.9
        }
      ]
    },
    infrastructure: [
      { name: "BINOM School", category: "Школа", distanceKm: 0.8, rating: 9.1 },
      { name: "Magnum", category: "Супермаркет", distanceKm: 0.4 },
      { name: "Green Mall", category: "ТЦ", distanceKm: 0.5 },
      { name: "City Polyclinic", category: "Больница", distanceKm: 0.9 }
    ],
    legal: {
      ownershipHistory: "1 собственник с момента ввода в эксплуатацию.",
      encumbrances: "Обременения не обнаружены.",
      pledgeCheck: "Не находится в залоге по данным внутренней проверки.",
      documentType: "Договор долевого участия, затем акт ввода"
    }
  },
  {
    id: "almaty-bostandyk-2-room",
    slug: "almaty-bostandyk-2-room-mountain-view",
    title: "2-комнатная квартира с видом на горы",
    category: "residential",
    propertyType: "Квартира",
    operation: "sale",
    city: "Алматы",
    district: "Бостандыкский",
    address: "пр. Аль-Фараби, рядом с Esentai Mall",
    coordinates: [76.9401, 43.2178],
    price: 61200000,
    currency: "KZT",
    pricePerSqm: 697000,
    areaTotal: 87.8,
    areaLiving: 39.2,
    areaKitchen: 18.4,
    rooms: "2",
    floor: 11,
    floorsTotal: 18,
    yearBuilt: 2020,
    buildingType: "Монолит",
    marketType: "Первичный",
    condition: "Дизайнерский",
    features: ["Вид на горы", "Система умный дом", "Подземный паркинг"],
    images: [apartmentImages[3], apartmentImages[4]],
    badges: ["Снижение цены"],
    nearbyCount: 28,
    distanceToTransitKm: 0.7,
    districtScore: 9.2,
    sourceName: "OLX.kz",
    sourceUrl: "https://olx.kz",
    publishedAt: "2026-04-14T11:00:00.000Z",
    description:
      "Премиальный формат для жизни и аренды в верхней части города. Высокий спрос на аренду со стороны экспатов.",
    seller: {
      name: "Dana Realty",
      phone: "+7 777 555 22 11",
      agency: "Dana Realty"
    },
    details: {
      balcony: "Есть",
      parking: "Подземная",
      furniture: "Полностью меблирована",
      appliances: true,
      internet: true,
      bathroomType: "Раздельный",
      ceilingHeight: 3.2,
      security: "Закрытая территория",
      elevator: "Пассажирский + грузовой",
      view: ["На горы"]
    },
    analytics: {
      priceTrend6m: [
        { month: "Ноя", value: 662000 },
        { month: "Дек", value: 667000 },
        { month: "Янв", value: 671000 },
        { month: "Фев", value: 680000 },
        { month: "Мар", value: 688000 },
        { month: "Апр", value: 697000 }
      ],
      priceTrend12m: [
        { month: "Май", value: 628000 },
        { month: "Июн", value: 636000 },
        { month: "Июл", value: 641000 },
        { month: "Авг", value: 648000 },
        { month: "Сен", value: 652000 },
        { month: "Окт", value: 658000 },
        { month: "Ноя", value: 662000 },
        { month: "Дек", value: 667000 },
        { month: "Янв", value: 671000 },
        { month: "Фев", value: 680000 },
        { month: "Мар", value: 688000 },
        { month: "Апр", value: 697000 }
      ],
      rentYield: 8.4,
      capRate: 6.8,
      roi1y: 10.1,
      roi3y: 29.6,
      roi5y: 54.4,
      depositComparison:
        "При сохранении спроса в Бостандыкском районе актив опережает средний депозит по доходности и ликвидности.",
      liquidity: "Высокая",
      exposureDays: 24,
      comparables: [
        {
          id: "comp-3",
          title: "Esentai City, 88 м²",
          price: 62400000,
          pricePerSqm: 709000,
          area: 88,
          distanceKm: 0.4
        },
        {
          id: "comp-4",
          title: "ЖК Forum Hills, 84 м²",
          price: 58100000,
          pricePerSqm: 691666,
          area: 84,
          distanceKm: 0.9
        }
      ]
    },
    infrastructure: [
      { name: "Haileybury", category: "Школа", distanceKm: 0.9, rating: 9.5 },
      { name: "Esentai Mall", category: "ТЦ", distanceKm: 0.3 },
      { name: "Invivo", category: "Аптека", distanceKm: 0.4 },
      { name: "Riverside Park", category: "Парк", distanceKm: 0.8 }
    ],
    legal: {
      ownershipHistory: "2 смены собственника, последняя сделка в 2024 году.",
      encumbrances: "Ограничений не найдено.",
      pledgeCheck: "Проверка на залог пройдена.",
      documentType: "Договор купли-продажи"
    }
  },
  {
    id: "astana-rent-1-room",
    slug: "astana-almaty-district-rent-1-room",
    title: "1-комнатная квартира для долгосрочной аренды",
    category: "residential",
    propertyType: "Квартира",
    operation: "rent_long",
    city: "Астана",
    district: "Алматинский",
    address: "ул. Б. Момышулы, рядом с Mega Silk Way",
    coordinates: [71.4671, 51.0917],
    price: 240000,
    currency: "KZT",
    pricePerSqm: 4800,
    areaTotal: 50,
    areaLiving: 21,
    areaKitchen: 12,
    rooms: "1",
    floor: 6,
    floorsTotal: 12,
    yearBuilt: 2018,
    buildingType: "Кирпич",
    marketType: "Вторичный",
    condition: "Косметический",
    features: ["Коммунальные частично включены", "Рядом остановка"],
    images: [apartmentImages[4]],
    badges: [],
    nearbyCount: 35,
    distanceToTransitKm: 0.2,
    districtScore: 7.6,
    sourceName: "Krisha.kz",
    sourceUrl: "https://krisha.kz",
    publishedAt: "2026-04-16T06:45:00.000Z",
    description:
      "Ликвидный арендный формат рядом с крупным торговым центром и транспортной развязкой.",
    seller: {
      name: "Собственник",
      phone: "+7 708 456 78 90"
    },
    details: {
      balcony: "Есть",
      parking: "Наземная",
      furniture: "Полностью меблирована",
      appliances: true,
      internet: true,
      bathroomType: "Совмещённый",
      ceilingHeight: 2.8,
      security: "Домофон",
      utilitiesIncluded: "Частично"
    },
    analytics: {
      priceTrend6m: [
        { month: "Ноя", value: 4300 },
        { month: "Дек", value: 4350 },
        { month: "Янв", value: 4400 },
        { month: "Фев", value: 4520 },
        { month: "Мар", value: 4680 },
        { month: "Апр", value: 4800 }
      ],
      priceTrend12m: [
        { month: "Май", value: 3950 },
        { month: "Июн", value: 4010 },
        { month: "Июл", value: 4090 },
        { month: "Авг", value: 4130 },
        { month: "Сен", value: 4200 },
        { month: "Окт", value: 4260 },
        { month: "Ноя", value: 4300 },
        { month: "Дек", value: 4350 },
        { month: "Янв", value: 4400 },
        { month: "Фев", value: 4520 },
        { month: "Мар", value: 4680 },
        { month: "Апр", value: 4800 }
      ],
      rentYield: 10.2,
      capRate: 8.7,
      roi1y: 7.8,
      roi3y: 21.1,
      roi5y: 36.9,
      depositComparison:
        "Арендный поток обгоняет депозит уже со второго года, но чувствителен к простоям.",
      liquidity: "Средняя",
      exposureDays: 18,
      comparables: [
        {
          id: "comp-5",
          title: "1-комнатная, 48 м²",
          price: 230000,
          pricePerSqm: 4791,
          area: 48,
          distanceKm: 0.7
        }
      ]
    },
    infrastructure: [
      { name: "Mega Silk Way", category: "ТЦ", distanceKm: 0.5 },
      { name: "Astana IT School", category: "Школа", distanceKm: 0.9, rating: 8.7 },
      { name: "Bus Hub", category: "Транспорт", distanceKm: 0.2 }
    ],
    legal: {
      ownershipHistory: "Данные ограничены для арендного объявления.",
      encumbrances: "Не проверялось в бесплатном контуре.",
      pledgeCheck: "Требует платной проверки.",
      documentType: "Свидетельство о праве собственности"
    }
  }
];

const districtCenters = {
  Астана: {
    "Есильский р-н": { lat: 51.1284, lng: 71.4302, score: 8.8, priceSqm: 550000 },
    Есиль: { lat: 51.1284, lng: 71.4302, score: 8.8, priceSqm: 550000 },
    "Алматинский р-н": { lat: 51.0917, lng: 71.4671, score: 7.6, priceSqm: 430000 },
    Алматинский: { lat: 51.0917, lng: 71.4671, score: 7.6, priceSqm: 430000 },
    "Сарыарка р-н": { lat: 51.1694, lng: 71.4048, score: 7.1, priceSqm: 395000 },
    Сарыарка: { lat: 51.1694, lng: 71.4048, score: 7.1, priceSqm: 395000 },
    "Нура р-н": { lat: 51.1093, lng: 71.4012, score: 8.2, priceSqm: 510000 },
    Нура: { lat: 51.1093, lng: 71.4012, score: 8.2, priceSqm: 510000 },
    "Сарайшык р-н": { lat: 51.1355, lng: 71.455, score: 8.4, priceSqm: 520000 },
    Сарайшык: { lat: 51.1355, lng: 71.455, score: 8.4, priceSqm: 520000 }
  },
  Алматы: {
    "Бостандыкский р-н": { lat: 43.2178, lng: 76.9401, score: 9.2, priceSqm: 690000 },
    Бостандыкский: { lat: 43.2178, lng: 76.9401, score: 9.2, priceSqm: 690000 },
    "Медеуский р-н": { lat: 43.2382, lng: 76.9656, score: 9.4, priceSqm: 730000 },
    Медеуский: { lat: 43.2382, lng: 76.9656, score: 9.4, priceSqm: 730000 },
    "Алмалинский р-н": { lat: 43.2565, lng: 76.9284, score: 8.6, priceSqm: 610000 },
    Алмалинский: { lat: 43.2565, lng: 76.9284, score: 8.6, priceSqm: 610000 },
    "Ауэзовский р-н": { lat: 43.2221, lng: 76.8413, score: 7.9, priceSqm: 500000 },
    Ауэзовский: { lat: 43.2221, lng: 76.8413, score: 7.9, priceSqm: 500000 }
  }
} as const;

type DistrictCenter = {
  lat: number;
  lng: number;
  score: number;
  priceSqm: number;
};

const buildTrend = (base: number, growth: number, labels: string[]) =>
  labels.map((month, index) => ({
    month,
    value: Math.round(base + growth * index)
  }));

const createGeneratedApartment = (index: number): Property => {
  const cities = Object.keys(districtCatalog) as Array<keyof typeof districtCatalog>;
  const city = cities[index % cities.length];
  const districts = districtCatalog[city];
  const district = districts[index % districts.length];
  const rooms = roomOptions[index % roomOptions.length];
  const operation = index % 5 === 0 ? "rent_long" : "sale";
  const buildingType = buildingTypes[index % buildingTypes.length];
  const condition = conditions[index % conditions.length];
  const marketType = marketTypes[index % marketTypes.length];
  const areaTotal = 38 + (index % 11) * 9 + (rooms === "5+" ? 18 : 0);
  const areaLiving = Math.round(areaTotal * 0.57);
  const areaKitchen = Math.round(areaTotal * 0.16);
  const floor = (index % 17) + 1;
  const floorsTotal = 9 + (index % 12);
  const yearBuilt = 2008 + (index % 17);
  const pricePerSqm =
    operation === "sale"
      ? district.basePriceSqm + (index % 7) * 12000 + (marketType === "Первичный" ? 22000 : 0)
      : 3800 + (index % 10) * 220 + (city === "Алматы" ? 400 : 0);
  const price =
    operation === "sale"
      ? Math.round(pricePerSqm * areaTotal)
      : Math.round(pricePerSqm * areaTotal * 0.92);
  const latOffset = ((index % 10) - 5) * 0.0065;
  const lngOffset = ((index % 12) - 6) * 0.0058;
  const rentYield = Number((6.8 + (index % 9) * 0.32).toFixed(1));
  const capRate = Number((5.9 + (index % 7) * 0.24).toFixed(1));
  const roi1y = Number((7.1 + (index % 8) * 0.5).toFixed(1));
  const roi3y = Number((22.4 + (index % 8) * 1.8).toFixed(1));
  const roi5y = Number((39.3 + (index % 8) * 2.7).toFixed(1));
  const nearbyCount = 18 + (index % 48);
  const distanceToTransitKm = Number((0.2 + (index % 8) * 0.12).toFixed(1));
  const imageShift = index % apartmentImages.length;
  const images = [
    apartmentImages[imageShift],
    apartmentImages[(imageShift + 1) % apartmentImages.length],
    apartmentImages[(imageShift + 2) % apartmentImages.length]
  ];
  const street = streets[index % streets.length];
  const badges = [
    marketType === "Первичный" ? "Новостройка" : "",
    index % 6 === 0 ? "Снижение цены" : "",
    index % 11 === 0 ? "Горячее предложение" : ""
  ].filter(Boolean);

  return {
    id: `seed-apartment-${index + 1}`,
    slug: `seed-apartment-${index + 1}-${city.toLowerCase()}-${district.name.toLowerCase()}`,
    title: `${rooms}-комнатная квартира в ${district.name} районе`,
    category: "residential",
    propertyType: "Квартира",
    operation,
    city,
    district: district.name,
    address: `ул. ${street}, дом ${(index % 49) + 3}`,
    coordinates: [Number((district.lng + lngOffset).toFixed(4)), Number((district.lat + latOffset).toFixed(4))],
    price,
    currency: "KZT",
    pricePerSqm,
    areaTotal,
    areaLiving,
    areaKitchen,
    rooms,
    floor,
    floorsTotal,
    yearBuilt,
    buildingType,
    marketType,
    condition,
    features: [
      buildingType,
      marketType,
      index % 2 === 0 ? "Подземный паркинг" : "Рядом остановка",
      city === "Алматы" && index % 3 === 0 ? "Вид на горы" : "Закрытый двор"
    ],
    images,
    badges,
    nearbyCount,
    distanceToTransitKm,
    districtScore: Number((district.score + (index % 4) * 0.1).toFixed(1)),
    sourceName: index % 2 === 0 ? "Krisha.kz" : "OLX.kz",
    sourceUrl: index % 2 === 0 ? "https://krisha.kz" : "https://olx.kz",
    publishedAt: new Date(Date.UTC(2026, 3, 1 + (index % 16), 8 + (index % 10), 15)).toISOString(),
    description:
      operation === "sale"
        ? "Подходит для собственного проживания и инвестиции. Ликвидный формат в востребованном районе."
        : "Готовый формат для долгосрочной аренды рядом с транспортом и инфраструктурой.",
    seller: {
      name: `Менеджер ${index + 1}`,
      phone: `+7 70${(index % 9) + 1} ${String(100 + (index % 900)).slice(0, 3)} ${String(
        10 + (index % 90)
      )} ${String(10 + ((index * 3) % 90))}`,
      agency: index % 3 === 0 ? "Qala Partners" : "Prime Realty Kazakhstan"
    },
    details: {
      balcony: index % 2 === 0 ? "Застеклён" : "Есть",
      parking: index % 3 === 0 ? "Подземная" : "Наземная",
      furniture: index % 4 === 0 ? "Полностью меблирована" : "Частично",
      appliances: true,
      internet: true,
      bathroomType: index % 5 === 0 ? "Раздельный" : "Совмещённый",
      ceilingHeight: Number((2.7 + (index % 4) * 0.1).toFixed(1)),
      security: index % 2 === 0 ? "Охрана и консьерж" : "Домофон",
      elevator: floorsTotal > 9 ? "Пассажирский + грузовой" : "Пассажирский",
      view: city === "Алматы" && index % 3 === 0 ? ["На горы"] : ["Во двор"]
    },
    analytics: {
      priceTrend6m: buildTrend(
        operation === "sale" ? pricePerSqm - 24000 : pricePerSqm - 700,
        operation === "sale" ? 4800 : 140,
        monthLabels6
      ),
      priceTrend12m: buildTrend(
        operation === "sale" ? pricePerSqm - 52000 : pricePerSqm - 1300,
        operation === "sale" ? 4200 : 120,
        monthLabels12
      ),
      rentYield,
      capRate,
      roi1y,
      roi3y,
      roi5y,
      depositComparison:
        "Модельный сценарий показывает умеренное преимущество над депозитом при стабильной экспозиции.",
      liquidity: roi3y > 30 ? "Высокая" : roi3y > 25 ? "Средняя" : "Ниже средней",
      exposureDays: 16 + (index % 27),
      comparables: [
        {
          id: `comp-a-${index + 1}`,
          title: `${rooms}-комнатная, ${areaTotal - 3} м²`,
          price: Math.round(price * 0.97),
          pricePerSqm: Math.round(pricePerSqm * 0.98),
          area: areaTotal - 3,
          distanceKm: 0.4
        },
        {
          id: `comp-b-${index + 1}`,
          title: `${rooms}-комнатная, ${areaTotal + 4} м²`,
          price: Math.round(price * 1.04),
          pricePerSqm: Math.round(pricePerSqm * 1.01),
          area: areaTotal + 4,
          distanceKm: 0.8
        }
      ]
    },
    infrastructure: [
      { name: `${district.name} School ${(index % 7) + 1}`, category: "Школа", distanceKm: 0.5, rating: 8.1 },
      { name: `${district.name} Market`, category: "Супермаркет", distanceKm: 0.3 },
      { name: `${district.name} Clinic`, category: "Больница", distanceKm: 0.9 },
      { name: `${district.name} Park`, category: "Парк", distanceKm: 0.7 }
    ],
    legal: {
      ownershipHistory: "Модельная история владения для seed-данных.",
      encumbrances: "Обременения не обнаружены в seed-данных.",
      pledgeCheck: "Проверка на залог не выявила рисков.",
      documentType: marketType === "Первичный" ? "ДДУ / акт ввода" : "Договор купли-продажи"
    }
  };
};

const generatedProperties = Array.from({ length: 247 }, (_item, index) => createGeneratedApartment(index));

const normalizeDistrict = (city: "Астана" | "Алматы", district: string) =>
  districtCenters[city][district as keyof (typeof districtCenters)[typeof city]]
    ? district
    : Object.keys(districtCenters[city]).find((name) => district.includes(name.replace(" р-н", ""))) ?? district;

const createRealListingProperty = (
  item: {
    id: string;
    sourceId: string;
    sourceName: string;
    sourceUrl: string;
    city: "Астана" | "Алматы";
    district: string;
    address: string;
    title: string;
    price: number;
    rooms?: string;
    areaTotal?: number;
    image?: string | null;
  },
  index: number
): Property => {
  const districtKey = normalizeDistrict(item.city, item.district);
  const cityCenters = districtCenters[item.city] as Record<string, DistrictCenter>;
  const center = cityCenters[districtKey] ?? cityCenters[Object.keys(cityCenters)[0]];
  const areaTotal = item.areaTotal ?? 48 + (index % 7) * 8;
  const pricePerSqm = Math.round(item.price / Math.max(areaTotal, 1));
  const yearBuilt = 2009 + (index % 16);
  const floor = (index % 14) + 1;
  const floorsTotal = Math.max(floor + 2, 9 + (index % 10));

  return {
    id: item.id,
    slug: item.sourceUrl.split("/").pop() ? `krisha-${item.sourceId}` : item.id,
    title: item.title,
    category: "residential",
    propertyType: "Квартира",
    operation: "sale",
    city: item.city,
    district: item.district,
    address: item.address,
    coordinates: [
      Number((center.lng + ((index % 11) - 5) * 0.0034).toFixed(4)),
      Number((center.lat + ((index % 13) - 6) * 0.0031).toFixed(4))
    ],
    price: item.price,
    currency: "KZT",
    pricePerSqm,
    areaTotal,
    areaLiving: Math.round(areaTotal * 0.56),
    areaKitchen: Math.round(areaTotal * 0.15),
    rooms: item.rooms,
    floor,
    floorsTotal,
    yearBuilt,
    buildingType: buildingTypes[index % buildingTypes.length],
    marketType: index % 2 === 0 ? "Первичный" : "Вторичный",
    condition: conditions[index % conditions.length],
    features: [
      "Настоящее объявление",
      index % 2 === 0 ? "Подземный паркинг" : "Рядом остановка",
      item.city === "Алматы" ? "Городская инфраструктура" : "Развитый район"
    ],
    images: item.image ? [item.image] : [apartmentImages[index % apartmentImages.length]],
    badges: ["Реальные данные"],
    nearbyCount: 14 + (index % 34),
    distanceToTransitKm: Number((0.2 + (index % 6) * 0.15).toFixed(1)),
    districtScore: center.score,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    publishedAt: new Date(Date.UTC(2026, 3, 10 + (index % 7), 9, 0)).toISOString(),
    description:
      "Карточка импортирована из реального объявления. Расширенная аналитика для MVP частично рассчитана автоматически поверх публичных полей.",
    seller: {
      name: "Контакт продавца скрыт в публичном импорте",
      phone: "Доступно после подключения детального парсинга"
    },
    details: {
      balcony: index % 2 === 0 ? "Есть" : "Застеклён",
      parking: index % 3 === 0 ? "Подземная" : "Наземная",
      furniture: index % 4 === 0 ? "Частично" : "Без мебели",
      appliances: true,
      internet: true,
      bathroomType: index % 5 === 0 ? "Раздельный" : "Совмещённый",
      ceilingHeight: Number((2.7 + (index % 3) * 0.1).toFixed(1)),
      security: "Данные уточняются",
      elevator: floorsTotal > 9 ? "Пассажирский + грузовой" : "Пассажирский",
      sourceImported: true
    },
    analytics: {
      priceTrend6m: buildTrend(pricePerSqm - 28000, 5400, monthLabels6),
      priceTrend12m: buildTrend(pricePerSqm - 56000, 4700, monthLabels12),
      rentYield: Number((6.9 + (index % 8) * 0.4).toFixed(1)),
      capRate: Number((5.8 + (index % 6) * 0.3).toFixed(1)),
      roi1y: Number((7.3 + (index % 7) * 0.5).toFixed(1)),
      roi3y: Number((22 + (index % 7) * 1.9).toFixed(1)),
      roi5y: Number((38 + (index % 7) * 2.8).toFixed(1)),
      depositComparison:
        "Сравнение с депозитом рассчитано на основе районной средней динамики и параметров объявления.",
      liquidity: pricePerSqm >= center.priceSqm ? "Средняя" : "Высокая",
      exposureDays: 17 + (index % 24),
      comparables: [
        {
          id: `${item.id}-comp-1`,
          title: `${item.rooms ?? "2"}-комнатная, ${Math.max(areaTotal - 4, 30)} м²`,
          price: Math.round(item.price * 0.96),
          pricePerSqm: Math.round(pricePerSqm * 0.97),
          area: Math.max(areaTotal - 4, 30),
          distanceKm: 0.4
        },
        {
          id: `${item.id}-comp-2`,
          title: `${item.rooms ?? "2"}-комнатная, ${areaTotal + 5} м²`,
          price: Math.round(item.price * 1.05),
          pricePerSqm: Math.round(pricePerSqm * 1.02),
          area: areaTotal + 5,
          distanceKm: 0.8
        }
      ]
    },
    infrastructure: [
      { name: `${item.district} School`, category: "Школа", distanceKm: 0.7, rating: 8.5 },
      { name: `${item.district} Market`, category: "Супермаркет", distanceKm: 0.4 },
      { name: `${item.district} Clinic`, category: "Больница", distanceKm: 0.9 },
      { name: `${item.district} Park`, category: "Парк", distanceKm: 0.8 }
    ],
    legal: {
      ownershipHistory: "Для реального импорта истории владения требуется отдельный источник данных.",
      encumbrances: "Публичный импорт не содержит данных об обременениях.",
      pledgeCheck: "Проверка на залог не включена в текущий публичный импорт.",
      documentType: "Не указано в публичной карточке"
    }
  };
};

const importedRealProperties = realProperties.map((item, index) => createRealListingProperty(item, index));

export const properties: Property[] = importedRealProperties.length
  ? importedRealProperties
  : [...featuredProperties, ...generatedProperties];

export const districtAnalytics = (
  Object.entries(districtCatalog) as Array<[keyof typeof districtCatalog, (typeof districtCatalog)["Астана"]]>
).flatMap(([city, districts]) =>
  districts.map((district) => {
    const districtProperties = properties.filter(
      (property) => property.city === city && property.district === district.name && property.operation === "sale"
    );
    const avgPriceSqm = Math.round(
      districtProperties.reduce((sum, property) => sum + property.pricePerSqm, 0) /
        Math.max(districtProperties.length, 1)
    );

    return {
      city,
      district: district.name,
      avgPriceSqm,
      listingsCount: districtProperties.length,
      demandIndex: district.score,
      trend: buildTrend(avgPriceSqm - 32000, 5200, monthLabels6)
    };
  })
);
