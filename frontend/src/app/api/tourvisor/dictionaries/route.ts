import { NextRequest, NextResponse } from "next/server";

import { booleanValue, integer, integerList, tourvisorErrorResponse } from "@/server/tourvisor/http";
import { tourvisorRequest } from "@/server/tourvisor/client";
import { rateLimit } from "@/server/tourvisor/rate-limit";

const RESOURCES = {
  departures: { path: "departures", allowed: ["departureCountryId"] },
  countries: { path: "countries", allowed: ["departureId", "onlyCharter", "onlyDirect"] },
  arrivals: { path: "arrivals", allowed: ["departureId", "onlyCharter", "onlyDirect"] },
  currencies: { path: "currencies", allowed: [] },
  meals: { path: "meals", allowed: [] },
  regions: { path: "regions", allowed: ["countryId", "arrivalId"] },
  subregions: { path: "subregions", allowed: ["countryId", "regionId"] },
  "hotel-types": { path: "hotel-types", allowed: ["countryId"] },
  "hotel-services": { path: "hotel-group-services", allowed: ["countryId", "regionIds"] },
  hotels: { path: "hotels", allowed: ["countryId", "regionId", "category", "types", "rating", "page", "limit"] },
  dates: { path: "tours/dates", allowed: ["departureId", "countryId", "arrivalId", "onlyCharter"] },
} as const;

type ResourceName = keyof typeof RESOURCES;

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "tourvisor-dictionaries", 100);
  if (limited) return limited;
  const resource = request.nextUrl.searchParams.get("resource") as ResourceName | null;
  if (!resource || !(resource in RESOURCES)) return NextResponse.json({ ok: false, error: { code: "INVALID_RESOURCE" } }, { status: 400 });
  const definition = RESOURCES[resource];
  const query = new URLSearchParams();

  for (const key of definition.allowed) {
    const values = request.nextUrl.searchParams.getAll(key);
    if (!values.length) continue;
    if (key === "onlyCharter" || key === "onlyDirect") {
      const parsed = booleanValue(values[0]);
      if (parsed === null) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });
      if (parsed !== undefined) query.set(key, String(parsed));
    } else if (key === "regionIds" || key === "types") {
      const parsed = integerList(values, 50);
      if (!parsed) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });
      parsed.forEach((value) => query.append(key, String(value)));
    } else {
      const limits = key === "limit" ? { min: 1, max: 100 } : key === "page" ? { min: 1, max: 10_000 } : key === "rating" || key === "category" ? { min: 0, max: 5 } : { min: 1 };
      const parsed = integer(values[0], limits);
      if (parsed === null || parsed === undefined) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });
      query.set(key, String(parsed));
    }
  }

  try {
    const data = await tourvisorRequest<unknown>(definition.path, query, { revalidate: resource === "dates" ? 300 : 3600 });
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": resource === "dates" ? "private, max-age=60" : "private, max-age=300" } });
  } catch (error) {
    return tourvisorErrorResponse(error);
  }
}
