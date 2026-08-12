import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { listings, viewingRequests } from "../../../../db/schema";
import { getRequestUserId } from "../../_lib/request-user";

type Action = "confirm" | "reject" | "reschedule";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ error: "请先登录。" }, { status: 401 });

  try {
    const { id } = await params;
    const payload = await request.json() as { action?: Action; requestedDate?: string; requestedTime?: string; publisherNote?: string };
    const action = payload.action;
    if (!action || !["confirm", "reject", "reschedule"].includes(action)) {
      return Response.json({ error: "请选择有效的预约处理方式。" }, { status: 400 });
    }

    const db = getDb();
    const [item] = await db.select({
      id: viewingRequests.id,
      status: viewingRequests.status,
      requestedDate: viewingRequests.requestedDate,
      requestedTime: viewingRequests.requestedTime,
      publisherId: listings.publisherId,
    }).from(viewingRequests)
      .innerJoin(listings, eq(viewingRequests.listingId, listings.id))
      .where(eq(viewingRequests.id, id))
      .limit(1);
    if (!item) return Response.json({ error: "看房预约不存在。" }, { status: 404 });
    if (item.publisherId !== userId) return Response.json({ error: "只有房源发布者可以处理这个预约。" }, { status: 403 });
    if (!['pending', 'rescheduled'].includes(item.status)) return Response.json({ error: "这个预约已经处理，不能重复操作。" }, { status: 409 });

    const requestedDate = payload.requestedDate?.trim() || "";
    const requestedTime = payload.requestedTime?.trim() || "";
    if (action === "reschedule" && (!requestedDate || !requestedTime)) {
      return Response.json({ error: "改期时需要填写新的日期和时间。" }, { status: 400 });
    }

    const status = action === "confirm" ? "confirmed" : action === "reject" ? "rejected" : "rescheduled";
    const [updated] = await db.update(viewingRequests).set({
      status,
      requestedDate: action === "reschedule" ? requestedDate : item.requestedDate,
      requestedTime: action === "reschedule" ? requestedTime : item.requestedTime,
      publisherNote: payload.publisherNote?.trim().slice(0, 500) || "",
      updatedAt: new Date().toISOString(),
    }).where(eq(viewingRequests.id, id)).returning();
    return Response.json({ request: updated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "预约处理失败。" }, { status: 500 });
  }
}
