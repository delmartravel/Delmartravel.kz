import "server-only";

import type { HotelRating, TourvisorSearchRequest } from "@/features/search/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RATINGS = new Set<HotelRating>([0, 2, 3, 4, 5]);

const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const safeInteger = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
const optionalInteger = (value: unknown, min: number, max: number) => value === undefined || safeInteger(value, min, max);
const integerArray = (value: unknown, maxItems: number, min: number, max: number) => value === undefined || (Array.isArray(value) && value.length <= maxItems && value.every((item) => safeInteger(item, min, max)));
const validDate = (value: unknown) => typeof value === "string" && DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export function validateTourvisorSearchRequest(value: unknown): TourvisorSearchRequest | null {
  if (!record(value)) return null;
  if (!safeInteger(value.departureId, 1, Number.MAX_SAFE_INTEGER) || !safeInteger(value.countryId, 1, Number.MAX_SAFE_INTEGER)) return null;
  if (!validDate(value.dateFrom) || !validDate(value.dateTo)) return null;
  const dateSpan = (Date.parse(`${value.dateTo}T00:00:00Z`) - Date.parse(`${value.dateFrom}T00:00:00Z`)) / 86_400_000;
  if (dateSpan < 0 || dateSpan > 20) return null;
  if (!safeInteger(value.nightsFrom, 1, 28) || !safeInteger(value.nightsTo, 1, 28) || Number(value.nightsTo) - Number(value.nightsFrom) > 10 || Number(value.nightsTo) < Number(value.nightsFrom)) return null;
  if (!safeInteger(value.adults, 1, 6) || !integerArray(value.childs, 3, 0, 17)) return null;
  if (!optionalInteger(value.meal, 0, Number.MAX_SAFE_INTEGER) || !optionalInteger(value.hotelCategory, 1, 5)) return null;
  if (!integerArray(value.hotelTypes, 50, 1, Number.MAX_SAFE_INTEGER) || !integerArray(value.hotelIds, 30, 1, Number.MAX_SAFE_INTEGER) || !integerArray(value.hotelServices, 100, 1, Number.MAX_SAFE_INTEGER)) return null;
  if (value.hotelRating !== undefined && (!safeInteger(value.hotelRating, 0, 5) || !RATINGS.has(value.hotelRating as HotelRating))) return null;
  if (!optionalInteger(value.arrivalId, 1, Number.MAX_SAFE_INTEGER) || !integerArray(value.regionIds, 100, 1, Number.MAX_SAFE_INTEGER) || !integerArray(value.subregionIds, 100, 1, Number.MAX_SAFE_INTEGER)) return null;
  if (!optionalInteger(value.priceFrom, 0, 1_000_000_000) || !optionalInteger(value.priceTo, 0, 1_000_000_000) || (typeof value.priceFrom === "number" && typeof value.priceTo === "number" && value.priceFrom > value.priceTo)) return null;
  if (typeof value.currency !== "string" || !/^[A-Z]{2,5}$/.test(value.currency) || typeof value.onlyCharter !== "boolean" || (value.onlyDirect !== undefined && typeof value.onlyDirect !== "boolean")) return null;

  return {
    departureId: value.departureId as number,
    countryId: value.countryId as number,
    dateFrom: value.dateFrom as string,
    dateTo: value.dateTo as string,
    nightsFrom: value.nightsFrom as number,
    nightsTo: value.nightsTo as number,
    adults: value.adults as number,
    childs: value.childs as number[] | undefined,
    meal: value.meal as number | undefined,
    hotelCategory: value.hotelCategory as number | undefined,
    hotelTypes: value.hotelTypes as number[] | undefined,
    hotelIds: value.hotelIds as number[] | undefined,
    hotelServices: value.hotelServices as number[] | undefined,
    hotelRating: value.hotelRating as HotelRating | undefined,
    arrivalId: value.arrivalId as number | undefined,
    regionIds: value.regionIds as number[] | undefined,
    subregionIds: value.subregionIds as number[] | undefined,
    priceFrom: value.priceFrom as number | undefined,
    priceTo: value.priceTo as number | undefined,
    currency: value.currency,
    onlyCharter: value.onlyCharter,
    onlyDirect: value.onlyDirect as boolean | undefined,
  };
}

export function requestToQuery(request: TourvisorSearchRequest) {
  const query = new URLSearchParams();
  Object.entries(request).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
    else query.set(key, String(value));
  });
  return query;
}
