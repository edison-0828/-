import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { listingDocuments, listings } from "../../../../db/schema";
import { getRequestUserId } from "../../_lib/request-user";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const [document] = await db.select().from(listingDocuments).where(eq(listingDocuments.id, id)).limit(1);
    if (!document || document.kind !== "listing_image") return new Response("Not found", { status: 404 });

    const [listing] = await db.select({ status: listings.status, publisherId: listings.publisherId }).from(listings).where(eq(listings.id, document.listingId)).limit(1);
    const viewerId = await getRequestUserId(request);
    if (!listing || (listing.status !== "published" && listing.publisherId !== viewerId)) return new Response("Not found", { status: 404 });

    const files = (env as unknown as { FILES?: R2Bucket }).FILES;
    if (!files) return new Response("Storage unavailable", { status: 503 });
    const object = await files.get(document.r2Key);
    if (!object) return new Response("Not found", { status: 404 });

    return new Response(object.body, {
      headers: {
        "content-type": document.contentType,
        "cache-control": listing.status === "published" ? "public, max-age=3600" : "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("File unavailable", { status: 500 });
  }
}
