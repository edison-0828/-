import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { listingVerificationCases, listings } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table")) return "房源数据表尚未初始化，请先应用 D1 migration。";
  return message;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get("city") || "深圳";
    const district = url.searchParams.get("district");
    const conditions = [eq(listings.city, city), eq(listings.status, "published")];
    if (district) conditions.push(eq(listings.district, district));
    const db = getDb();
    const rows = await db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.exposureScore), desc(listings.createdAt)).limit(50);
    return Response.json({ listings: rows });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const publisherId = getRequestUserId(request);
  if (!publisherId) return Response.json({ error: "请先登录。" }, { status: 401 });
  try {
    const payload = await request.json() as Partial<typeof listings.$inferInsert>;
    const title = payload.title?.trim() || "";
    const district = payload.district?.trim() || "";
    const community = payload.community?.trim() || "";
    const availableFrom = payload.availableFrom || "";
    const leaseEndsAt = payload.leaseEndsAt || "";
    const monthlyRentCents = Number(payload.monthlyRentCents || 0);
    if (!title || !district || !community || !availableFrom || !leaseEndsAt || monthlyRentCents <= 0) {
      return Response.json({ error: "标题、区域、小区、租金、可入住时间和到期时间均为必填项。" }, { status: 400 });
    }
    if (leaseEndsAt < availableFrom) return Response.json({ error: "租约到期时间不能早于可入住时间。" }, { status: 400 });
    const db = getDb();
    const [listing] = await db.insert(listings).values({
      id: crypto.randomUUID(), publisherId, title, city: payload.city || "深圳", district, community,
      monthlyRentCents, availableFrom, leaseEndsAt, description: payload.description?.trim() || "",
      status: "pending_review", exposureScore: 0,
    }).returning();
    await db.insert(listingVerificationCases).values({ id: crypto.randomUUID(), listingId: listing.id, userId: publisherId, contractStatus: "pending", paymentStatus: "skipped" });
    return Response.json({ listing }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
