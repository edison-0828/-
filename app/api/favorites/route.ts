import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { favorites, listings } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ favoriteIds: [] });

  try {
    const rows = await getDb().select({ listingId: favorites.listingId })
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    return Response.json({ favoriteIds: rows.map((row) => row.listingId) }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "收藏加载失败。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ error: "请先登录后再收藏房源。" }, { status: 401 });

  try {
    const payload = await request.json() as { listingId?: string };
    const listingId = payload.listingId?.trim() || "";
    if (!listingId) return Response.json({ error: "缺少房源信息。" }, { status: 400 });

    const db = getDb();
    const [listing] = await db.select({ id: listings.id, status: listings.status }).from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing || listing.status !== "published") return Response.json({ error: "房源不存在或尚未公开。" }, { status: 404 });

    await db.insert(favorites).values({ id: crypto.randomUUID(), userId, listingId }).onConflictDoNothing();
    return Response.json({ saved: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "收藏失败。" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) return Response.json({ error: "请先登录。" }, { status: 401 });

  const listingId = new URL(request.url).searchParams.get("listingId")?.trim() || "";
  if (!listingId) return Response.json({ error: "缺少房源信息。" }, { status: 400 });

  try {
    await getDb().delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return Response.json({ saved: false });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "取消收藏失败。" }, { status: 500 });
  }
}
