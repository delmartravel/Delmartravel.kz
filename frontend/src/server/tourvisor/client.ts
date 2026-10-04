import "server-only";

const DEFAULT_BASE_URL = "https://api.tourvisor.ru/search/api/v1";
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;

export class TourvisorConfigurationError extends Error {}
export class TourvisorUpstreamError extends Error {
  constructor(public readonly status: number) {
    super("Tourvisor request failed");
  }
}

type RequestOptions = {
  method?: "GET" | "POST";
  cache?: RequestCache;
  revalidate?: number;
};

async function limitedJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) throw new TourvisorUpstreamError(502);
  if (!response.body) throw new TourvisorUpstreamError(502);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new TourvisorUpstreamError(502);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body)) as T;
  } catch {
    throw new TourvisorUpstreamError(502);
  }
}

export async function tourvisorRequest<T>(path: string, query = new URLSearchParams(), options: RequestOptions = {}): Promise<T> {
  const token = process.env.TOURVISOR_API_TOKEN?.trim();
  if (!token) throw new TourvisorConfigurationError("Tourvisor API is not configured");

  const baseUrl = process.env.TOURVISOR_API_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const parsedBaseUrl = new URL(baseUrl);
  if (process.env.NODE_ENV === "production" && parsedBaseUrl.protocol !== "https:") {
    throw new TourvisorConfigurationError("Tourvisor API URL must use HTTPS");
  }
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
  url.search = query.toString();

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: options.cache ?? "no-store",
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new TourvisorUpstreamError(response.status);
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_RESPONSE_BYTES) throw new TourvisorUpstreamError(502);
  return limitedJson<T>(response);
}

export function publicTourvisorConfig() {
  const departureCountryId = Number(process.env.TOURVISOR_DEPARTURE_COUNTRY_ID ?? 3);
  return {
    configured: Boolean(process.env.TOURVISOR_API_TOKEN?.trim()),
    departureCountryId: [1, 2, 3, 4, 5, 99].includes(departureCountryId) ? departureCountryId : 3,
    defaultCurrency: process.env.TOURVISOR_DEFAULT_CURRENCY?.trim() || null,
  };
}
