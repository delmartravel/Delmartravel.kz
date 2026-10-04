import { NextRequest, NextResponse } from "next/server";

import { tourvisorRequest } from "@/server/tourvisor/client";
import { integer, tourvisorErrorResponse } from "@/server/tourvisor/http";
import { rateLimit, validateMutationRequest } from "@/server/tourvisor/rate-limit";
import { sanitizeSearchResults, sanitizeSearchStatus } from "@/server/tourvisor/sanitize";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ searchId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const limited = rateLimit(request, "tourvisor-search-read", 120);
  if (limited) return limited;
  const { searchId: rawSearchId } = await context.params;
  const searchId = integer(rawSearchId, { min: 1, required: true });
  const view = request.nextUrl.searchParams.get("view") ?? "results";
  if (searchId === null || searchId === undefined || (view !== "results" && view !== "status")) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });

  const query = new URLSearchParams();
  if (view === "results") {
    const limit = integer(request.nextUrl.searchParams.get("limit") ?? "25", { min: 1, max: 100, required: true });
    if (limit === null || limit === undefined) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });
    query.set("limit", String(limit));
  } else {
    query.set("operatorStatus", "false");
  }

  try {
    const path = view === "status" ? `tours/search/${searchId}/status` : `tours/search/${searchId}`;
    const upstream = await tourvisorRequest<unknown>(path, query);
    const data = view === "results" ? sanitizeSearchResults(upstream) : sanitizeSearchStatus(upstream);
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return tourvisorErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  const rejected = validateMutationRequest(request);
  if (rejected) return rejected;
  const limited = rateLimit(request, "tourvisor-search-continue", 2);
  if (limited) return limited;
  const { searchId: rawSearchId } = await context.params;
  const searchId = integer(rawSearchId, { min: 1, required: true });
  if (searchId === null || searchId === undefined) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });
  try {
    const data = await tourvisorRequest<unknown>(`tours/search/${searchId}/continue`);
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return tourvisorErrorResponse(error);
  }
}
