export function getRequestUserId(request: Request) {
  const authenticatedUserId = request.headers.get("oai-authenticated-user-id");
  if (authenticatedUserId) return authenticatedUserId;
  return new URL(request.url).hostname === "localhost" ? "demo-user" : null;
}
