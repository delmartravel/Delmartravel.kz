# Tourvisor server configuration

Configure these values only in the server environment. Never prefix the token with `NEXT_PUBLIC_`.

```env
TOURVISOR_API_TOKEN=replace-with-jwt-from-tourvisor
TOURVISOR_DEPARTURE_COUNTRY_ID=3
TOURVISOR_DEFAULT_CURRENCY=KZT
```

Optional override for testing against an approved Tourvisor-compatible endpoint:

```env
TOURVISOR_API_BASE_URL=https://api.tourvisor.ru/search/api/v1
```

The browser calls only `/api/tourvisor/*`. The JWT is added by the Next.js server and is never returned to the client.

Search results are filtered on the server before they reach the browser. Operator
objects and operator links are intentionally excluded from the public response.
The built-in rate limiter is a baseline for local and single-instance use; use a
shared edge or Redis-backed limiter before horizontally scaling production.
