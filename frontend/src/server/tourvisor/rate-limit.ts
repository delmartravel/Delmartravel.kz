import "server-only";

import { NextRequest, NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

function sweepBuckets(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS && buckets.size < MAX_BUCKETS) return;
  lastSweepAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value as string | undefined;
    if (!oldestKey) break;
    buckets.delete(oldestKey);
  }
}

function clientKey(request: NextRequest) {
  const candidate = request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "local";
  return /^[a-f\d:.]{1,64}$/i.test(candidate) ? candidate : "unknown";
}

export function rateLimit(request: NextRequest, namespace: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  sweepBuckets(now);
  const key = `${namespace}:${clientKey(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED" } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  current.count += 1;
  return null;
}

export function validateMutationRequest(request: NextRequest, options: { requireJson?: boolean; maxBytes?: number } = {}) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN_ORIGIN" } }, { status: 403 });
  }

  if (options.requireJson && !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: { code: "UNSUPPORTED_MEDIA_TYPE" } }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > (options.maxBytes ?? 32_768)) {
    return NextResponse.json({ ok: false, error: { code: "PAYLOAD_TOO_LARGE" } }, { status: 413 });
  }

  return null;
}
