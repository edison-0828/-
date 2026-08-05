export function getRequestUserId(request: Request) {
  const authenticatedUserId = request.headers.get("oai-authenticated-user-id");
  if (authenticatedUserId) return authenticatedUserId;
  return process.env.NODE_ENV !== "production" ? "demo-user" : null;
}
