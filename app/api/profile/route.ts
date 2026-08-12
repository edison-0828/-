import { desc, eq, inArray, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { favorites, listings, messages, viewingRequests } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ error: "请先登录。" }, { status: 401 });

  try {
    const db = getDb();
    const myListings = await db.select({
      id: listings.id,
      title: listings.title,
      district: listings.district,
      community: listings.community,
      monthlyRentCents: listings.monthlyRentCents,
      availableFrom: listings.availableFrom,
      status: listings.status,
      createdAt: listings.createdAt,
    }).from(listings).where(eq(listings.publisherId, userId)).orderBy(desc(listings.createdAt)).limit(30);

    const favoriteListings = await db.select({
      id: listings.id,
      title: listings.title,
      district: listings.district,
      community: listings.community,
      monthlyRentCents: listings.monthlyRentCents,
      availableFrom: listings.availableFrom,
      savedAt: favorites.createdAt,
    }).from(favorites)
      .innerJoin(listings, eq(favorites.listingId, listings.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .limit(30);

    const messageRows = await db.select({
      id: messages.id,
      listingId: messages.listingId,
      listingTitle: listings.title,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      body: messages.body,
      createdAt: messages.createdAt,
      readAt: messages.readAt,
    }).from(messages)
      .innerJoin(listings, eq(messages.listingId, listings.id))
      .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
      .orderBy(desc(messages.createdAt))
      .limit(100);

    const conversations = new Map<string, {
      id: string;
      listingId: string;
      listingTitle: string;
      participantId: string;
      body: string;
      direction: "sent" | "received";
      createdAt: string;
      unreadCount: number;
    }>();
    for (const message of messageRows) {
      const participantId = message.senderId === userId ? message.recipientId : message.senderId;
      const key = `${message.listingId}:${participantId}`;
      const existing = conversations.get(key);
      if (!existing) {
        conversations.set(key, {
          id: message.id,
          listingId: message.listingId,
          listingTitle: message.listingTitle,
          participantId,
          body: message.body,
          direction: message.senderId === userId ? "sent" : "received",
          createdAt: message.createdAt,
          unreadCount: message.recipientId === userId && !message.readAt ? 1 : 0,
        });
      } else if (message.recipientId === userId && !message.readAt) {
        existing.unreadCount += 1;
      }
    }

    const myListingIds = myListings.map((listing) => listing.id);
    const viewingCondition = myListingIds.length
      ? or(eq(viewingRequests.seekerId, userId), inArray(viewingRequests.listingId, myListingIds))
      : eq(viewingRequests.seekerId, userId);
    const viewingRows = await db.select({
      id: viewingRequests.id,
      listingId: viewingRequests.listingId,
      listingTitle: listings.title,
      seekerId: viewingRequests.seekerId,
      requestedDate: viewingRequests.requestedDate,
      requestedTime: viewingRequests.requestedTime,
      note: viewingRequests.note,
      publisherNote: viewingRequests.publisherNote,
      status: viewingRequests.status,
      createdAt: viewingRequests.createdAt,
    }).from(viewingRequests)
      .innerJoin(listings, eq(viewingRequests.listingId, listings.id))
      .where(viewingCondition)
      .orderBy(desc(viewingRequests.createdAt))
      .limit(30);

    return Response.json({
      listings: myListings,
      favorites: favoriteListings,
      messages: Array.from(conversations.values()),
      viewings: viewingRows.map((viewing) => ({ ...viewing, role: viewing.seekerId === userId ? "seeker" : "publisher" })),
    }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "个人中心加载失败。" }, { status: 500 });
  }
}
