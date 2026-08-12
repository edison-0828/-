import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings, messages, viewingRequests } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

function conversationWhere(listingId: string, firstUserId: string, secondUserId: string) {
  return and(
    eq(messages.listingId, listingId),
    or(
      and(eq(messages.senderId, firstUserId), eq(messages.recipientId, secondUserId)),
      and(eq(messages.senderId, secondUserId), eq(messages.recipientId, firstUserId)),
    ),
  );
}

async function resolveConversation(userId: string, listingId: string, requestedParticipantId = "") {
  const db = getDb();
  const [listing] = await db.select({
    id: listings.id,
    publisherId: listings.publisherId,
    title: listings.title,
    district: listings.district,
    community: listings.community,
    monthlyRentCents: listings.monthlyRentCents,
    status: listings.status,
  }).from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) return { error: "房源不存在。", status: 404 as const };

  let participantId = userId === listing.publisherId ? requestedParticipantId : listing.publisherId;
  if (userId === listing.publisherId && !participantId) {
    const [latest] = await db.select({ senderId: messages.senderId, recipientId: messages.recipientId })
      .from(messages)
      .where(and(eq(messages.listingId, listingId), or(eq(messages.senderId, userId), eq(messages.recipientId, userId))))
      .orderBy(desc(messages.createdAt))
      .limit(1);
    participantId = latest ? (latest.senderId === userId ? latest.recipientId : latest.senderId) : "";
  }
  if (!participantId || participantId === userId) return { error: "找不到对应的沟通对象。", status: 400 as const };

  const [priorMessage] = await db.select({ id: messages.id }).from(messages)
    .where(conversationWhere(listingId, userId, participantId)).limit(1);
  if (userId === listing.publisherId) {
    const priorViewing = priorMessage ? undefined : (await db.select({ id: viewingRequests.id }).from(viewingRequests)
      .where(and(eq(viewingRequests.listingId, listingId), eq(viewingRequests.seekerId, participantId))).limit(1))[0];
    if (!priorMessage && !priorViewing) return { error: "只能回复咨询或预约过这套房的用户。", status: 403 as const };
  } else if (listing.status !== "published" && !priorMessage) {
    return { error: "该房源尚未公开，暂不能发起沟通。", status: 403 as const };
  }

  return { db, listing, participantId };
}

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ error: "请先登录。" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const listingId = url.searchParams.get("listingId")?.trim() || "";
    const participantId = url.searchParams.get("participantId")?.trim() || "";
    if (!listingId) return Response.json({ error: "缺少房源信息。" }, { status: 400 });

    const resolved = await resolveConversation(userId, listingId, participantId);
    if ("error" in resolved) return Response.json({ error: resolved.error }, { status: resolved.status });

    const rows = await resolved.db.select().from(messages)
      .where(conversationWhere(listingId, userId, resolved.participantId))
      .orderBy(asc(messages.createdAt))
      .limit(200);
    return Response.json({
      listing: resolved.listing,
      participant: {
        id: resolved.participantId,
        label: userId === resolved.listing.publisherId ? "咨询这套房的租客" : "房源发布者",
      },
      messages: rows.map((message) => ({ ...message, mine: message.senderId === userId })),
    }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "消息加载失败。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const senderId = await getRequestUserId(request);
  if (!senderId) return Response.json({ error: "请先登录。" }, { status: 401 });

  try {
    const payload = await request.json() as { listingId?: string; body?: string; participantId?: string };
    const listingId = payload.listingId?.trim() || "";
    const body = payload.body?.trim() || "";
    if (!listingId || !body) return Response.json({ error: "房源和消息内容均为必填项。" }, { status: 400 });
    if (body.length > 1000) return Response.json({ error: "消息不能超过 1000 个字符。" }, { status: 400 });

    const resolved = await resolveConversation(senderId, listingId, payload.participantId?.trim() || "");
    if ("error" in resolved) return Response.json({ error: resolved.error }, { status: resolved.status });
    const [message] = await resolved.db.insert(messages).values({
      id: crypto.randomUUID(),
      listingId,
      senderId,
      recipientId: resolved.participantId,
      body,
    }).returning();
    return Response.json({ message: { ...message, mine: true } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "消息发送失败。" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ error: "请先登录。" }, { status: 401 });

  try {
    const payload = await request.json() as { listingId?: string; participantId?: string };
    const listingId = payload.listingId?.trim() || "";
    if (!listingId) return Response.json({ error: "缺少房源信息。" }, { status: 400 });
    const resolved = await resolveConversation(userId, listingId, payload.participantId?.trim() || "");
    if ("error" in resolved) return Response.json({ error: resolved.error }, { status: resolved.status });

    await resolved.db.update(messages).set({ readAt: sql`CURRENT_TIMESTAMP` }).where(and(
      eq(messages.listingId, listingId),
      eq(messages.senderId, resolved.participantId),
      eq(messages.recipientId, userId),
      isNull(messages.readAt),
    ));
    return Response.json({ read: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "消息状态更新失败。" }, { status: 500 });
  }
}
