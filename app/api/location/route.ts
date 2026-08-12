import { nearestChinaCity, normalizeChinaCity } from "../../_lib/china-cities";

type CloudflareRequest = Request & {
  cf?: {
    city?: string;
    region?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
};

function finiteCoordinate(value: string | null | undefined) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedLatitude = finiteCoordinate(url.searchParams.get("lat"));
  const requestedLongitude = finiteCoordinate(url.searchParams.get("lng"));
  if (requestedLatitude !== null && requestedLongitude !== null) {
    const city = nearestChinaCity(requestedLatitude, requestedLongitude);
    return Response.json({ city: city || null, source: city ? "gps" : "none" }, { headers: { "cache-control": "private, max-age=3600" } });
  }

  const cf = (request as CloudflareRequest).cf;
  const cloudflareLatitude = finiteCoordinate(cf?.latitude);
  const cloudflareLongitude = finiteCoordinate(cf?.longitude);
  const nearestCity = cloudflareLatitude !== null && cloudflareLongitude !== null
    ? nearestChinaCity(cloudflareLatitude, cloudflareLongitude)
    : "";
  const city = nearestCity || normalizeChinaCity(cf?.city);
  return Response.json({
    city: city || null,
    province: normalizeChinaCity(cf?.region) || null,
    source: city ? "ip" : "none",
  }, { headers: { "cache-control": "private, max-age=1800" } });
}
