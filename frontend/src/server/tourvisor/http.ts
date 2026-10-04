import "server-only";

import { NextResponse } from "next/server";

import { TourvisorConfigurationError, TourvisorUpstreamError } from "./client";

export function tourvisorErrorResponse(error: unknown) {
  if (error instanceof TourvisorConfigurationError) {
    return NextResponse.json({ ok: false, error: { code: "NOT_CONFIGURED" } }, { status: 503 });
  }
  if (error instanceof TourvisorUpstreamError) {
    const status = error.status === 401 || error.status === 403 ? 502 : error.status >= 400 && error.status < 600 ? error.status : 502;
    return NextResponse.json({ ok: false, error: { code: "UPSTREAM_ERROR" } }, { status });
  }
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return NextResponse.json({ ok: false, error: { code: "UPSTREAM_TIMEOUT" } }, { status: 504 });
  }
  return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
}

export function integer(value: string | null, options: { min?: number; max?: number; required?: boolean } = {}) {
  if (value === null || value === "") return options.required ? null : undefined;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < (options.min ?? 0) || parsed > (options.max ?? Number.MAX_SAFE_INTEGER)) return null;
  return parsed;
}

export function booleanValue(value: string | null) {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function integerList(values: string[], maxItems = 50) {
  if (values.length > maxItems) return null;
  const parsed = values.flatMap((value) => value.split(",")).map((value) => integer(value, { min: 1 }));
  return parsed.some((value) => value === null || value === undefined) ? null : parsed as number[];
}
