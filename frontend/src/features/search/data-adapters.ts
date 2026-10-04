import type { SearchOption, TourSearchState, TourvisorSearchRequest } from "./types";

export type DepartureCityGroup = { letter: string; cities: SearchOption[] };

export function groupDepartureCities(cities: SearchOption[], locale = "ru"): DepartureCityGroup[] {
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
  return cities
    .filter((city) => city.name.trim())
    .slice()
    .sort((left, right) => collator.compare(left.name, right.name))
    .reduce<DepartureCityGroup[]>((groups, city) => {
      const letter = Array.from(city.name.trim())[0]?.toLocaleUpperCase(locale) ?? "";
      const previous = groups.at(-1);
      if (!previous || previous.letter !== letter) groups.push({ letter, cities: [city] });
      else previous.cities.push(city);
      return groups;
    }, []);
}

export type SearchRequestIssue =
  | "unsupportedHotelOnlyMode"
  | "searchType"
  | "departureId"
  | "countryId"
  | "dates"
  | "dateRange"
  | "nights"
  | "nightsRange"
  | "adults"
  | "childrenCount"
  | "childrenAges"
  | "budgetRange"
  | "currency";

export type SearchRequestResult =
  | { ok: true; request: TourvisorSearchRequest }
  | { ok: false; issues: SearchRequestIssue[] };

/** Converts the provider-neutral UI state into the official Tourvisor search contract. */
export function toTourvisorSearchRequest(state: TourSearchState): SearchRequestResult {
  const issues: SearchRequestIssue[] = [];
  if (state.searchType === null) issues.push("searchType");
  if (state.searchType === "hotel") issues.push("unsupportedHotelOnlyMode");
  if (state.departureId === null) issues.push("departureId");
  if (state.countryId === null) issues.push("countryId");
  if (!state.departureDates.from || !state.departureDates.to) issues.push("dates");
  if (state.departureDates.from && state.departureDates.to) {
    const days = (Date.parse(state.departureDates.to) - Date.parse(state.departureDates.from)) / 86_400_000;
    if (days < 0 || days > 20) issues.push("dateRange");
  }
  if (state.nights.min === null || state.nights.max === null) issues.push("nights");
  if (state.nights.min !== null && state.nights.max !== null && (state.nights.min < 1 || state.nights.max > 28 || state.nights.max - state.nights.min > 10)) issues.push("nightsRange");
  if (state.tourists.adults < 1 || state.tourists.adults > 6) issues.push("adults");
  if (state.tourists.childrenAges.length > 3) issues.push("childrenCount");
  if (state.tourists.childrenAges.some((age) => age === null || age < 0 || age > 17)) issues.push("childrenAges");
  if (state.budget.min !== null && state.budget.max !== null && state.budget.min > state.budget.max) issues.push("budgetRange");
  if (!state.budget.currency) issues.push("currency");
  if (issues.length) return { ok: false, issues };

  const optionalArray = (values: number[]) => values.length ? values : undefined;
  return {
    ok: true,
    request: {
      departureId: state.departureId!,
      countryId: state.countryId!,
      dateFrom: state.departureDates.from!,
      dateTo: state.departureDates.to!,
      nightsFrom: state.nights.min!,
      nightsTo: state.nights.max!,
      adults: state.tourists.adults,
      childs: optionalArray(state.tourists.childrenAges as number[]),
      meal: state.mealId ?? undefined,
      hotelCategory: state.hotelCategory ?? undefined,
      hotelTypes: optionalArray(state.hotelTypeIds),
      hotelIds: optionalArray(state.hotelIds.slice(0, 30)),
      hotelServices: optionalArray(state.hotelServiceIds),
      hotelRating: state.hotelRating ?? undefined,
      arrivalId: state.arrivalId ?? undefined,
      regionIds: optionalArray(state.regionIds),
      subregionIds: optionalArray(state.subregionIds),
      priceFrom: state.budget.min ?? undefined,
      priceTo: state.budget.max ?? undefined,
      currency: state.budget.currency!,
      onlyCharter: state.onlyCharter,
      onlyDirect: state.onlyDirect || undefined,
    },
  };
}
