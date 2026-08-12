import { env } from "cloudflare:workers";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { listingDocuments, listingVerificationCases, listings } from "../../../db/schema";
import { getRequestUserId } from "../_lib/request-user";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table")) return "房源数据表尚未初始化，请先应用 D1 migration。";
  if (message.includes("R2 binding")) return "文件存储尚未连接，请稍后重试。";
  return message;
}

function bucket() {
  const files = (env as unknown as { FILES?: R2Bucket }).FILES;
  if (!files) throw new Error("R2 binding `FILES` is unavailable.");
  return files;
}

function textField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function fileField(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

function fileFields(values: FormDataEntryValue[]) {
  return values.filter((value): value is File => value instanceof File && value.size > 0);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "file";
}

function withImages<T extends { id: string }>(rows: T[], documents: Array<{ id: string; listingId: string }>) {
  const byListing = new Map<string, string[]>();
  for (const document of documents) {
    const urls = byListing.get(document.listingId) || [];
    urls.push(`/api/listing-files/${encodeURIComponent(document.id)}`);
    byListing.set(document.listingId, urls);
  }
  return rows.map((row) => ({ ...row, imageUrls: byListing.get(row.id) || [] }));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get("city") || "深圳";
    const district = url.searchParams.get("district");
    const viewerId = await getRequestUserId(request);
    const visibility = viewerId
      ? or(eq(listings.status, "published"), eq(listings.publisherId, viewerId))
      : eq(listings.status, "published");
    const conditions = [eq(listings.city, city), visibility];
    if (district) conditions.push(eq(listings.district, district));

    const db = getDb();
    const rows = await db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.exposureScore), desc(listings.createdAt)).limit(50);
    if (!rows.length) return Response.json({ listings: [] });

    const documents = await db.select({ id: listingDocuments.id, listingId: listingDocuments.listingId })
      .from(listingDocuments)
      .where(and(inArray(listingDocuments.listingId, rows.map((row) => row.id)), eq(listingDocuments.kind, "listing_image")))
      .orderBy(asc(listingDocuments.createdAt));
    return Response.json({ listings: withImages(rows, documents) });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const publisherId = await getRequestUserId(request);
  if (!publisherId) return Response.json({ error: "请先登录后再发布房源。" }, { status: 401 });

  const uploadedKeys: string[] = [];
  try {
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return Response.json({ error: "请通过发布表单提交房源与证明材料。" }, { status: 415 });
    }

    const form = await request.formData();
    const title = textField(form, "title");
    const district = textField(form, "district");
    const community = textField(form, "community");
    const availableFrom = textField(form, "availableFrom");
    const leaseEndsAt = textField(form, "leaseEndsAt");
    const description = textField(form, "description");
    const monthlyRentCents = Number(textField(form, "monthlyRentCents"));
    const contract = fileField(form.get("contract"));
    const images = fileFields(form.getAll("images")).slice(0, 8);
    const payments = fileFields(form.getAll("payments")).slice(0, 6);

    if (!title || !district || !community || !availableFrom || !leaseEndsAt || monthlyRentCents <= 0) {
      return Response.json({ error: "标题、区域、小区、租金、可入住时间和到期时间均为必填项。" }, { status: 400 });
    }
    if (leaseEndsAt < availableFrom) return Response.json({ error: "租约到期时间不能早于可入住时间。" }, { status: 400 });
    if (!contract) return Response.json({ error: "请上传与这套房源对应的租赁合同。" }, { status: 400 });
    if (!DOCUMENT_TYPES.has(contract.type) || contract.size > MAX_DOCUMENT_BYTES) return Response.json({ error: "合同仅支持 15MB 以内的 PDF、JPG 或 PNG。" }, { status: 400 });
    if (!images.length) return Response.json({ error: "请至少上传一张房源实拍图片。" }, { status: 400 });
    if (images.some((file) => !IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES)) return Response.json({ error: "房源图片仅支持 10MB 以内的 JPG、PNG 或 WebP。" }, { status: 400 });
    if (payments.some((file) => !DOCUMENT_TYPES.has(file.type) || file.size > MAX_DOCUMENT_BYTES)) return Response.json({ error: "支付记录仅支持 15MB 以内的 PDF、JPG 或 PNG。" }, { status: 400 });

    const listingId = crypto.randomUUID();
    const files = bucket();
    const documentRows: Array<typeof listingDocuments.$inferInsert> = [];
    const upload = async (file: File, kind: string) => {
      const id = crypto.randomUUID();
      const key = `listings/${listingId}/${kind}/${id}-${safeFileName(file.name)}`;
      await files.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
      uploadedKeys.push(key);
      documentRows.push({ id, listingId, ownerId: publisherId, kind, fileName: file.name, contentType: file.type, r2Key: key });
    };

    await upload(contract, "lease_contract");
    for (const image of images) await upload(image, "listing_image");
    for (const payment of payments) await upload(payment, "payment_record");

    const db = getDb();
    const listing: typeof listings.$inferInsert = {
      id: listingId, publisherId, title, city: "深圳", district, community,
      monthlyRentCents, availableFrom, leaseEndsAt, description,
      status: "pending_review", exposureScore: 0,
    };
    const verification: typeof listingVerificationCases.$inferInsert = {
      id: crypto.randomUUID(), listingId, userId: publisherId,
      contractStatus: "pending", paymentStatus: payments.length ? "pending" : "skipped",
    };
    await db.batch([
      db.insert(listings).values(listing),
      db.insert(listingVerificationCases).values(verification),
      db.insert(listingDocuments).values(documentRows),
    ]);

    const imageDocuments = documentRows.filter((document) => document.kind === "listing_image").map((document) => ({ id: document.id, listingId }));
    return Response.json({ listing: withImages([listing], imageDocuments)[0] }, { status: 201 });
  } catch (error) {
    if (uploadedKeys.length) {
      const files = bucket();
      await Promise.allSettled(uploadedKeys.map((key) => files.delete(key)));
    }
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
