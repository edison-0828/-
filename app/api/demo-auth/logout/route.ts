import { DEMO_AUTH_COOKIE, isDemoAuthEnabled } from "../../../chatgpt-auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requested = requestUrl.searchParams.get("return_to") || "/";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  const responseHeaders = new Headers({ location: new URL(returnTo, requestUrl.origin).toString() });

  if (isDemoAuthEnabled()) {
    responseHeaders.append("set-cookie", `${DEMO_AUTH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  }

  return new Response(null, { status: 302, headers: responseHeaders });
}
