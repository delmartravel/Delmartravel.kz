import "server-only";

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const stringValue = (value: unknown) => typeof value === "string" ? value : "";
const numberValue = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
const imageList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && /^https?:\/\//i.test(item)) : [];

function entity(value: unknown) {
  if (!isRecord(value)) return null;
  const id = numberValue(value.id);
  const name = stringValue(value.name);
  return id !== null && name ? { id, name } : null;
}

export function sanitizeHotelDetails(value: unknown) {
  const source = Array.isArray(value) ? value[0] : value;
  if (!isRecord(source)) return null;
  const common = isRecord(source.common) ? source.common : {};
  const infrastructure = isRecord(source.infrastructure) ? source.infrastructure : {};
  const meals = isRecord(source.meals) ? source.meals : {};
  const services = isRecord(source.services) ? source.services : {};
  return {
    id: numberValue(source.id),
    name: stringValue(source.name),
    category: numberValue(source.category),
    rating: numberValue(source.rating),
    country: entity(source.country),
    region: entity(source.region),
    subRegion: entity(source.subRegion),
    images: imageList(source.images),
    common: {
      address: stringValue(common.address),
      build: stringValue(common.build),
      description: stringValue(common.description),
      latitude: numberValue(common.latitude),
      longitude: numberValue(common.longitude),
      place: stringValue(common.place),
      repair: stringValue(common.repair),
      square: stringValue(common.square),
    },
    infrastructure: { beach: stringValue(infrastructure.beach), territory: stringValue(infrastructure.territory) },
    meals: { description: stringValue(meals.description), list: stringValue(meals.list) },
    roomTypes: stringValue(source.roomTypes),
    services: {
      animation: stringValue(services.animation),
      available: stringValue(services.available),
      child: stringValue(services.child),
      free: stringValue(services.free),
      inRoom: stringValue(services.inRoom),
      servicesPay: stringValue(services.servicesPay),
    },
  };
}

export function sanitizeRooms(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((room) => {
    if (!isRecord(room) || numberValue(room.id) === null) return [];
    return [{
      id: numberValue(room.id),
      name: stringValue(room.name),
      area: numberValue(room.area),
      bedroomCount: numberValue(room.bedroomCount),
      roomCount: numberValue(room.roomCount),
      comment: stringValue(room.comment),
      description: stringValue(room.description),
      location: stringValue(room.location),
      services: stringValue(room.services),
      sleepingPlaces: stringValue(room.sleepingPlaces),
      viewDescription: stringValue(room.viewDescription),
      hasBalcony: room.hasBalcony === true,
      hasKitchen: room.hasKitchen === true,
      images: imageList(room.images),
    }];
  });
}
