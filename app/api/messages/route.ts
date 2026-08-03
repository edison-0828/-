import { getDb } from "../../../db";
import { messages } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function POST(request: Request) {
  const senderId = getRequestUserId(request);
  if (!senderId) return Response.json({ error: "请先登录。" }, { status: 401 });
  try {
    const payload = await request.json() as { listingId?: string; recipientId?: string; body?: string };
    const listingId = payload.listingId?.trim() || "";
    const recipientId = payload.recipientId?.trim() || "";
    const body = payload.body?.trim() || "";
    if (!listingId || !recipientId || !body) return Response.json({ error: "房源、接收者和消息内容均为必填项。" }, { status: 400 });
    if (body.length > 1000) return Response.json({ error: "消息不能超过 1000 个字符。" }, { status: 400 });
    const db = getDb();
    const [message] = await db.insert(messages).values({ id: crypto.randomUUID(), listingId, senderId, recipientId, body }).returning();
    return Response.json({ message }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "消息发送失败。" }, { status: 500 });
  }
}
