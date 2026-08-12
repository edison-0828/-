import { and, count, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings, messages, viewingRequests } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ unreadMessages: 0, pendingViewings: 0, total: 0 });

  try {
    const db = getDb();
    const [[messageCount], [viewingCount]] = await Promise.all([
      db.select({ value: count() }).from(messages).where(and(eq(messages.recipientId, userId), isNull(messages.readAt))),
      db.select({ value: count() }).from(viewingRequests)
        .innerJoin(listings, eq(viewingRequests.listingId, listings.id))
        .where(and(eq(listings.publisherId, userId), eq(viewingRequests.status, "pending"))),
    ]);
    const unreadMessages = messageCount?.value || 0;
    const pendingViewings = viewingCount?.value || 0;
    return Response.json({ unreadMessages, pendingViewings, total: unreadMessages + pendingViewings }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "提醒加载失败。" }, { status: 500 });
  }
}
