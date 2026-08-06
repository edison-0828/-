import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { listingDocuments, listings } from "../../../../db/schema";
import { getRequestUserId } from "../../_lib/request-user";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    const viewerId = getRequestUserId(request);
    if (!listing || (listing.status !== "published" && listing.publisherId !== viewerId)) {
      return Response.json({ error: "房源不存在或已下架。" }, { status: 404 });
    }

    const images = await db.select({ id: listingDocuments.id }).from(listingDocuments)
      .where(and(eq(listingDocuments.listingId, id), eq(listingDocuments.kind, "listing_image")))
      .orderBy(asc(listingDocuments.createdAt));
    return Response.json({
      listing: {
        ...listing,
        imageUrls: images.map((image) => `/api/listing-files/${encodeURIComponent(image.id)}`),
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "房源加载失败。" }, { status: 500 });
  }
}
