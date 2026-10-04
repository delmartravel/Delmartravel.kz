import { NextResponse } from "next/server";

import { publicTourvisorConfig } from "@/server/tourvisor/client";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, data: publicTourvisorConfig() }, { headers: { "Cache-Control": "no-store" } });
}
