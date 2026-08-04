import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings, messages } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function POST(request: Request) {
  const senderId = getRequestUserId(request);
  if (!senderId) return Response.json({ error: "请先登录。" }, { status: 401 });
  try {
    const payload = await request.json() as { listingId?: string; body?: string };
    const listingId = payload.listingId?.trim() || "";
    const body = payload.body?.trim() || "";
    if (!listingId || !body) return Response.json({ error: "房源和消息内容均为必填项。" }, { status: 400 });
    if (body.length > 1000) return Response.json({ error: "消息不能超过 1000 个字符。" }, { status: 400 });
    const db = getDb();
    const [listing] = await db.select({ publisherId: listings.publisherId, status: listings.status }).from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing) return Response.json({ error: "房源不存在。" }, { status: 404 });
    if (listing.status !== "published") return Response.json({ error: "该房源尚未公开，暂不能联系发布者。" }, { status: 400 });
    if (listing.publisherId === senderId) return Response.json({ error: "不能给自己的房源发送消息。" }, { status: 400 });
    const [message] = await db.insert(messages).values({ id: crypto.randomUUID(), listingId, senderId, recipientId: listing.publisherId, body }).returning();
    return Response.json({ message }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "消息发送失败。" }, { status: 500 });
  }
}
