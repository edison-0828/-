import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ user: null }, { headers: { "cache-control": "private, no-store" } });
  return Response.json({ user: { id: user.userId, displayName: user.displayName, email: user.email, authMethod: user.authMethod } }, { headers: { "cache-control": "private, no-store" } });
}
