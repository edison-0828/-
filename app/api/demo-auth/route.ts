import { cookies } from "next/headers";
import { DEMO_AUTH_COOKIE, isDemoAuthEnabled } from "../../chatgpt-auth";

export async function POST(request: Request) {
  if (!isDemoAuthEnabled()) {
    return Response.json({ error: "Demo 登录仅在本地开发环境开放。" }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({})) as { action?: string; phone?: string };
  const action = payload.action === "register" ? "register" : "login";
  const phone = String(payload.phone || "demo").trim().slice(0, 32) || "demo";
  const suffix = phone.length > 4 ? phone.slice(-4) : phone;
  const publisherDemo = ["publisher", "房东", "转租者"].includes(phone.toLowerCase());
  const demoUser = {
    userId: publisherDemo ? "demo-publisher-001" : "demo-user",
    displayName: publisherDemo ? "演示转租者" : action === "register" ? `新用户 ${suffix}` : `演示用户 ${suffix}`,
    phone,
  };

  const cookieStore = await cookies();
  cookieStore.set(DEMO_AUTH_COOKIE, encodeURIComponent(JSON.stringify(demoUser)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ user: demoUser });
}
