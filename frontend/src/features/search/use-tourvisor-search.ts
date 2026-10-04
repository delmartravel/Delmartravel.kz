"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { TourvisorHotelResult, TourvisorSearchRequest, TourvisorTourResult } from "./types";

type SearchPhase = "idle" | "loading" | "ready" | "error";
type SearchState = { phase: SearchPhase; progress: number; results: TourvisorHotelResult[]; error: string | null };
type Envelope<T> = { ok: true; data: T } | { ok: false; error: { code: string } };

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const numberOrNull = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const entity = (value: unknown) => isRecord(value) && Number.isSafeInteger(value.id) && typeof value.name === "string" ? { id: value.id as number, name: value.name } : null;

function tour(value: unknown): TourvisorTourResult | null {
  if (!isRecord(value) || (typeof value.id !== "string" && typeof value.id !== "number")) return null;
  const meal = isRecord(value.meal) && Number.isSafeInteger(value.meal.id) && typeof value.meal.name === "string" ? { id: value.meal.id as number, name: value.meal.name, russianName: typeof value.meal.russianName === "string" ? value.meal.russianName : undefined } : null;
  return {
    id: String(value.id), name: text(value.name), date: text(value.date), nights: numberOrNull(value.nights) ?? 0,
    adults: numberOrNull(value.adults) ?? 0, childrenCount: numberOrNull(value.childs) ?? 0,
    price: numberOrNull(value.price) ?? 0, currency: text(value.currency), roomType: text(value.roomType), placement: text(value.placement),
    roomId: numberOrNull(value.roomId), meal, hotelPlace: numberOrNull(value.hotelPlace),
    flightNights: numberOrNull(value.flightNights) ?? 0, flightPlace: numberOrNull(value.flightPlace), fuelCharge: numberOrNull(value.fuelCharge) ?? 0,
    isCharter: value.isCharter === true, isPromo: value.isPromo === true,
  };
}

function normalizeResults(value: unknown): TourvisorHotelResult[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !Number.isSafeInteger(item.id) || typeof item.name !== "string") return [];
    return [{
      id: item.id as number,
      name: item.name,
      category: numberOrNull(item.category) ?? 0,
      rating: numberOrNull(item.rating) ?? 0,
      price: numberOrNull(item.price) ?? 0,
      currency: text(item.currency),
      pictureUrl: typeof item.picturelink === "string" ? item.picturelink : null,
      description: typeof item.hotelDescription === "string" ? item.hotelDescription : null,
      hasDescription: item.hasDescription === true,
      hasPictures: item.hasPictures === true,
      latitude: numberOrNull(item.latitude),
      longitude: numberOrNull(item.longitude),
      seaDistance: numberOrNull(item.seaDistance),
      country: entity(item.country),
      region: entity(item.region),
      subregion: entity(item.subRegion),
      tours: Array.isArray(item.tours) ? item.tours.flatMap((entry) => { const parsed = tour(entry); return parsed ? [parsed] : []; }) : [],
    }];
  });
}

async function json<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { Accept: "application/json", "Content-Type": "application/json", ...init?.headers } });
  const payload = await response.json() as Envelope<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.ok ? "REQUEST_FAILED" : payload.error.code);
  return payload.data;
}

export function useTourvisorSearch() {
  const [state, setState] = useState<SearchState>({ phase: "idle", progress: 0, results: [], error: null });
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const start = useCallback(async (request: TourvisorSearchRequest) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ phase: "loading", progress: 0, results: [], error: null });
    try {
      const started = await json<{ searchId: number }>("/api/tourvisor/search", { method: "POST", body: JSON.stringify(request), signal: controller.signal });
      const deadline = Date.now() + 45_000;
      let latest: TourvisorHotelResult[] = [];
      await abortableDelay(3_000, controller.signal);
      while (!controller.signal.aborted && Date.now() < deadline) {
        const [status, resultData] = await Promise.all([
          json<{ progress?: number; status?: string }>(`/api/tourvisor/search/${started.searchId}?view=status`, { signal: controller.signal }),
          json<unknown>(`/api/tourvisor/search/${started.searchId}?view=results&limit=25`, { signal: controller.signal }),
        ]);
        latest = normalizeResults(resultData);
        const progress = typeof status.progress === "number" ? Math.max(0, Math.min(100, status.progress)) : 0;
        setState({ phase: "loading", progress, results: latest, error: null });
        if (progress >= 100 || ["finished", "complete", "completed"].includes(String(status.status).toLowerCase())) break;
        await abortableDelay(3_000, controller.signal);
      }
      if (!controller.signal.aborted) setState({ phase: "ready", progress: 100, results: latest, error: null });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const code = (error as Error).message;
      const message = code === "NOT_CONFIGURED" ? "Сервис поиска пока не настроен." : code === "UPSTREAM_TIMEOUT" ? "Tourvisor не ответил вовремя." : "Не удалось выполнить поиск. Попробуйте ещё раз.";
      setState({ phase: "error", progress: 0, results: [], error: message });
    }
  }, []);

  return { ...state, start };
}

function abortableDelay(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, duration);
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}
