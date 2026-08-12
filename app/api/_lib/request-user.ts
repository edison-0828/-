import { getChatGPTUser } from "../../chatgpt-auth";

export async function getRequestUserId(request: Request) {
  const authenticatedUserId = request.headers.get("oai-authenticated-user-id");
  if (authenticatedUserId) return authenticatedUserId;
  const user = await getChatGPTUser();
  return user?.userId || null;
}
