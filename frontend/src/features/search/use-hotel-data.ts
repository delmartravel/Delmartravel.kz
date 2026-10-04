"use client";

import { useCallback, useRef, useState } from "react";

import type { TourvisorHotelDetails, TourvisorRoomDetails } from "./types";

type Envelope<T> = { ok: true; data: T } | { ok: false; error: { code: string } };
type LoadState = "idle" | "loading" | "ready" | "unavailable";

async function api<T>(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  const payload = await response.json() as Envelope<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.ok ? "REQUEST_FAILED" : payload.error.code);
  return payload.data;
}

export function useHotelData(hotelId: number) {
  const [details, setDetails] = useState<TourvisorHotelDetails | null>(null);
  const [rooms, setRooms] = useState<TourvisorRoomDetails[]>([]);
  const [detailsState, setDetailsState] = useState<LoadState>("idle");
  const [roomsState, setRoomsState] = useState<LoadState>("idle");
  const detailsPromise = useRef<Promise<TourvisorHotelDetails | null> | null>(null);
  const roomsKey = useRef("");

  const loadDetails = useCallback(() => {
    if (details) return Promise.resolve(details);
    if (detailsState === "unavailable") return Promise.resolve(null);
    if (detailsPromise.current) return detailsPromise.current;
    setDetailsState("loading");
    detailsPromise.current = api<TourvisorHotelDetails>(`/api/tourvisor/hotels/${hotelId}`)
      .then((value) => { setDetails(value); setDetailsState("ready"); return value; })
      .catch(() => { setDetailsState("unavailable"); return null; })
      .finally(() => { detailsPromise.current = null; });
    return detailsPromise.current;
  }, [details, detailsState, hotelId]);

  const loadRooms = useCallback(async (ids: number[]) => {
    const unique = Array.from(new Set(ids.filter((id) => Number.isSafeInteger(id) && id > 0))).slice(0, 30);
    const key = unique.join(",");
    if (!key || roomsKey.current === key) return rooms;
    roomsKey.current = key;
    setRoomsState("loading");
    try {
      const query = new URLSearchParams();
      unique.forEach((id) => query.append("ids", String(id)));
      const value = await api<TourvisorRoomDetails[]>(`/api/tourvisor/rooms?${query}`);
      setRooms(value);
      setRoomsState("ready");
      return value;
    } catch {
      roomsKey.current = "";
      setRoomsState("unavailable");
      return [];
    }
  }, [rooms]);

  return { details, detailsState, rooms, roomsState, loadDetails, loadRooms };
}
