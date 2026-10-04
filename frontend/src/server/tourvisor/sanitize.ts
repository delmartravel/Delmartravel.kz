import "server-only";

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

function entity(value: unknown) {
  if (!isRecord(value)) return null;
  return {
    id: value.id,
    name: value.name,
    ...(value.countryId !== undefined ? { countryId: value.countryId } : {}),
    ...(value.regionId !== undefined ? { regionId: value.regionId } : {}),
  };
}

function meal(value: unknown) {
  if (!isRecord(value)) return null;
  return {
    id: value.id,
    name: value.name,
    russianName: value.russianName,
    fullName: value.fullName,
    fullRussianName: value.fullRussianName,
  };
}

function tour(value: unknown) {
  if (!isRecord(value)) return null;
  return {
    id: value.id,
    name: value.name,
    date: value.date,
    nights: value.nights,
    adults: value.adults,
    childs: value.childs,
    price: value.price,
    currency: value.currency,
    placement: value.placement,
    roomId: value.roomId,
    roomType: value.roomType,
    meal: meal(value.meal),
    hotelPlace: value.hotelPlace,
    flightNights: value.flightNights,
    flightPlace: value.flightPlace,
    fuelCharge: value.fuelCharge,
    isCharter: value.isCharter,
    isPromo: value.isPromo,
  };
}

/** Keeps the public result contract useful while never exposing operator data. */
export function sanitizeSearchResults(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((hotel) => {
    if (!isRecord(hotel)) return [];
    return [{
      id: hotel.id,
      name: hotel.name,
      category: hotel.category,
      rating: hotel.rating,
      price: hotel.price,
      currency: hotel.currency,
      picturelink: hotel.picturelink,
      hotelDescription: hotel.hotelDescription,
      hasDescription: hotel.hasDescription,
      hasPictures: hotel.hasPictures,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      seaDistance: hotel.seaDistance,
      country: entity(hotel.country),
      region: entity(hotel.region),
      subRegion: entity(hotel.subRegion),
      tours: Array.isArray(hotel.tours) ? hotel.tours.map(tour).filter(Boolean) : [],
    }];
  });
}

export function sanitizeSearchStatus(value: unknown) {
  if (!isRecord(value)) return {};
  return {
    searchId: value.searchId,
    status: value.status,
    progress: value.progress,
    minPrice: value.minPrice,
    timePassed: value.timePassed,
  };
}
