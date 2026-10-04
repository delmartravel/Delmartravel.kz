"use client";

import { useEffect, useState } from "react";

import type { CurrencyOption, HotelOption, RegionOption, SearchOption, SubregionOption, TourSearchDataSource, TourSearchState } from "./types";

type DataStatus = "checking" | "ready" | "not-configured" | "error";
type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { code: string } };

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const options = (value: unknown): SearchOption[] => Array.isArray(value) ? value.flatMap((item) => isRecord(item) && Number.isSafeInteger(item.id) && typeof item.name === "string" ? [{ id: item.id as number, name: item.name }] : []) : [];
const currencies = (value: unknown): CurrencyOption[] => Array.isArray(value) ? value.flatMap((item) => isRecord(item) && typeof item.id === "string" && typeof item.name === "string" ? [{ id: item.id, name: item.name }] : []) : [];
const regions = (value: unknown): RegionOption[] => Array.isArray(value) ? value.flatMap((item) => isRecord(item) && Number.isSafeInteger(item.id) && Number.isSafeInteger(item.countryId) && typeof item.name === "string" ? [{ id: item.id as number, countryId: item.countryId as number, name: item.name }] : []) : [];
const subregions = (value: unknown): SubregionOption[] => Array.isArray(value) ? value.flatMap((item) => isRecord(item) && Number.isSafeInteger(item.id) && Number.isSafeInteger(item.regionId) && typeof item.name === "string" ? [{ id: item.id as number, regionId: item.regionId as number, name: item.name }] : []) : [];
const hotels = (value: unknown): HotelOption[] => Array.isArray(value) ? value.flatMap((item) => {
  if (!isRecord(item) || !Number.isSafeInteger(item.id) || typeof item.name !== "string") return [];
  const region = isRecord(item.region) && Number.isSafeInteger(item.region.id) ? item.region.id as number : undefined;
  return [{ id: item.id as number, name: item.name, regionId: region }];
}) : [];
const services = (value: unknown): SearchOption[] => Array.isArray(value) ? value.flatMap((group) => isRecord(group) ? options(group.items) : []) : [];

async function api<T>(resource: string, params: Record<string, string | number | boolean | number[] | null | undefined>, signal: AbortSignal): Promise<T> {
  const query = new URLSearchParams({ resource });
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
    else query.set(key, String(value));
  });
  const response = await fetch(`/api/tourvisor/dictionaries?${query}`, { signal, headers: { Accept: "application/json" } });
  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.ok ? "REQUEST_FAILED" : payload.error.code);
  return payload.data;
}

export function useTourvisorData(state: TourSearchState) {
  const [data, setData] = useState<TourSearchDataSource>({});
  const [status, setStatus] = useState<DataStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/tourvisor/config", { signal: controller.signal, cache: "no-store" });
        const payload = await response.json() as ApiEnvelope<{ configured: boolean; departureCountryId: number; defaultCurrency: string | null }>;
        if (!payload.ok || !payload.data.configured) return setStatus("not-configured");
        const [departureData, currencyData, mealData] = await Promise.all([
          api<unknown>("departures", { departureCountryId: payload.data.departureCountryId }, controller.signal),
          api<unknown>("currencies", {}, controller.signal),
          api<unknown>("meals", {}, controller.signal),
        ]);
        setData((current) => ({ ...current, defaultCurrency: payload.data.defaultCurrency ?? undefined, departureCities: options(departureData), currencies: currencies(currencyData), meals: options(mealData) }));
        setStatus("ready");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (status !== "ready" || state.departureId === null) return;
    const controller = new AbortController();
    Promise.all([
      api<unknown>("countries", { departureId: state.departureId, onlyCharter: state.onlyCharter, onlyDirect: state.onlyDirect }, controller.signal),
      api<unknown>("arrivals", { departureId: state.departureId, onlyCharter: state.onlyCharter, onlyDirect: state.onlyDirect }, controller.signal),
    ]).then(([countryData, arrivalData]) => setData((current) => ({ ...current, countries: options(countryData), arrivals: options(arrivalData) }))).catch((error) => { if ((error as Error).name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, [state.departureId, state.onlyCharter, state.onlyDirect, status]);

  useEffect(() => {
    if (status !== "ready" || state.countryId === null) return;
    const controller = new AbortController();
    const common = { countryId: state.countryId };
    Promise.all([
      api<unknown>("regions", { ...common, arrivalId: state.arrivalId }, controller.signal),
      api<unknown>("subregions", common, controller.signal),
      api<unknown>("hotel-types", common, controller.signal),
      api<unknown>("hotel-services", { ...common, regionIds: state.regionIds }, controller.signal),
      api<unknown>("hotels", { ...common, page: 1, limit: 100 }, controller.signal),
      state.departureId === null ? Promise.resolve(undefined) : api<unknown>("dates", { departureId: state.departureId, countryId: state.countryId, arrivalId: state.arrivalId, onlyCharter: state.onlyCharter }, controller.signal),
    ]).then(([regionData, subregionData, typeData, serviceData, hotelData, dateData]) => setData((current) => ({
      ...current,
      regions: regions(regionData),
      subregions: subregions(subregionData),
      hotelTypes: options(typeData),
      hotelServices: services(serviceData),
      hotels: hotels(hotelData),
      availableDepartureDates: Array.isArray(dateData) ? dateData.filter((date): date is string => typeof date === "string") : undefined,
    }))).catch((error) => { if ((error as Error).name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, [state.arrivalId, state.countryId, state.departureId, state.onlyCharter, state.regionIds, status]);

  return { data, status };
}
