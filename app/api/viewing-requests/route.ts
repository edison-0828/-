import { getDb } from "../../../db";
import { viewingRequests } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function POST(request: Request) {
  const seekerId = getRequestUserId(request);
  if (!seekerId) return Response.json({ error: "请先登录。" }, { status: 401 });
  try {
    const payload = await request.json() as { listingId?: string; requestedDate?: string; requestedTime?: string; note?: string };
    const listingId = payload.listingId?.trim() || "";
    const requestedDate = payload.requestedDate?.trim() || "";
    const requestedTime = payload.requestedTime?.trim() || "";
    if (!listingId || !requestedDate || !requestedTime) return Response.json({ error: "房源、日期和时间均为必填项。" }, { status: 400 });
    const db = getDb();
    const [item] = await db.insert(viewingRequests).values({ id: crypto.randomUUID(), listingId, seekerId, requestedDate, requestedTime, note: payload.note?.trim() || "", status: "pending" }).returning();
    return Response.json({ request: item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "预约提交失败。" }, { status: 500 });
  }
}
