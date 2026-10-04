import { NextRequest, NextResponse } from "next/server";

import { tourvisorRequest } from "@/server/tourvisor/client";
import { tourvisorErrorResponse } from "@/server/tourvisor/http";
import { rateLimit, validateMutationRequest } from "@/server/tourvisor/rate-limit";
import { requestToQuery, validateTourvisorSearchRequest } from "@/server/tourvisor/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rejected = validateMutationRequest(request, { requireJson: true, maxBytes: 32_768 });
  if (rejected) return rejected;
  const limited = rateLimit(request, "tourvisor-search-start", 6);
  if (limited) return limited;
  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 32_768) {
      return NextResponse.json({ ok: false, error: { code: "PAYLOAD_TOO_LARGE" } }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: { code: "INVALID_JSON" } }, { status: 400 });
  }
  const validated = validateTourvisorSearchRequest(body);
  if (!validated) return NextResponse.json({ ok: false, error: { code: "INVALID_SEARCH_PARAMETERS" } }, { status: 400 });

  try {
    const data = await tourvisorRequest<{ searchId: number }>("tours/search", requestToQuery(validated));
    if (!Number.isSafeInteger(data?.searchId) || data.searchId <= 0) throw new Error("Invalid upstream response");
    return NextResponse.json({ ok: true, data: { searchId: data.searchId } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return tourvisorErrorResponse(error);
  }
}
