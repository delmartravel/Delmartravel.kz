import { NextRequest, NextResponse } from "next/server";

import { tourvisorRequest } from "@/server/tourvisor/client";
import { sanitizeHotelDetails } from "@/server/tourvisor/hotel-sanitize";
import { integer, tourvisorErrorResponse } from "@/server/tourvisor/http";
import { rateLimit } from "@/server/tourvisor/rate-limit";

type Context = { params: Promise<{ hotelId: string }> };

export async function GET(request: NextRequest, context: Context) {
  const limited = rateLimit(request, "tourvisor-hotel-details", 60);
  if (limited) return limited;
  const { hotelId: rawHotelId } = await context.params;
  const hotelId = integer(rawHotelId, { min: 1, required: true });
  if (!hotelId) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });

  try {
    const upstream = await tourvisorRequest<unknown>(`hotels/${hotelId}`);
    const data = sanitizeHotelDetails(upstream);
    if (!data) return NextResponse.json({ ok: false, error: { code: "UPSTREAM_INVALID_RESPONSE" } }, { status: 502 });
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    return tourvisorErrorResponse(error);
  }
}
