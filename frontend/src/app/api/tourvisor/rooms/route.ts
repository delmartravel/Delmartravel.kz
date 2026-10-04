import { NextRequest, NextResponse } from "next/server";

import { tourvisorRequest } from "@/server/tourvisor/client";
import { sanitizeRooms } from "@/server/tourvisor/hotel-sanitize";
import { integerList, tourvisorErrorResponse } from "@/server/tourvisor/http";
import { rateLimit } from "@/server/tourvisor/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "tourvisor-room-details", 60);
  if (limited) return limited;
  const ids = integerList(request.nextUrl.searchParams.getAll("ids"), 30);
  if (!ids?.length) return NextResponse.json({ ok: false, error: { code: "INVALID_PARAMETER" } }, { status: 400 });

  const query = new URLSearchParams();
  ids.forEach((id) => query.append("ids", String(id)));
  try {
    const upstream = await tourvisorRequest<unknown>("rooms", query, { revalidate: 3600 });
    return NextResponse.json({ ok: true, data: sanitizeRooms(upstream) }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    return tourvisorErrorResponse(error);
  }
}
