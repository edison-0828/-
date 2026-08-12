import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings, viewingRequests } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function POST(request: Request) {
  const seekerId = await getRequestUserId(request);
  if (!seekerId) return Response.json({ error: "请先登录。" }, { status: 401 });
  try {
    const payload = await request.json() as { listingId?: string; requestedDate?: string; requestedTime?: string; note?: string };
    const listingId = payload.listingId?.trim() || "";
    const requestedDate = payload.requestedDate?.trim() || "";
    const requestedTime = payload.requestedTime?.trim() || "";
    if (!listingId || !requestedDate || !requestedTime) return Response.json({ error: "房源、日期和时间均为必填项。" }, { status: 400 });
    const db = getDb();
    const [listing] = await db.select({ publisherId: listings.publisherId, status: listings.status }).from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing) return Response.json({ error: "房源不存在。" }, { status: 404 });
    if (listing.status !== "published") return Response.json({ error: "该房源尚未公开，暂不能预约看房。" }, { status: 400 });
    if (listing.publisherId === seekerId) return Response.json({ error: "不能预约自己的房源。" }, { status: 400 });
    const [item] = await db.insert(viewingRequests).values({ id: crypto.randomUUID(), listingId, seekerId, requestedDate, requestedTime, note: payload.note?.trim() || "", status: "pending" }).returning();
    return Response.json({ request: item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "预约提交失败。" }, { status: 500 });
  }
}
