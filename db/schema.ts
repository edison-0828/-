import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Durable product state for the Shenzhen launch.
 * Raw identity documents and payment images belong in R2; D1 stores only
 * ownership, verification state and searchable metadata.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("seeker"),
  realNameStatus: text("real_name_status").notNull().default("not_started"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  phoneUnique: uniqueIndex("ux_users_phone").on(table.phone),
  realNameStatusIdx: index("idx_users_real_name_status").on(table.realNameStatus),
}));

export const verificationCases = sqliteTable("verification_cases", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  realNameStatus: text("real_name_status").notNull().default("pending"),
  contractStatus: text("contract_status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("skipped"),
  contractNameMasked: text("contract_name_masked"),
  contractAddressMasked: text("contract_address_masked"),
  reviewedBy: text("reviewed_by"),
  reviewNote: text("review_note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdx: index("idx_verification_cases_user_id").on(table.userId),
  reviewIdx: index("idx_verification_cases_review_status").on(table.realNameStatus, table.contractStatus),
}));

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  publisherId: text("publisher_id").notNull(),
  title: text("title").notNull(),
  city: text("city").notNull().default("深圳"),
  district: text("district").notNull(),
  community: text("community").notNull(),
  monthlyRentCents: integer("monthly_rent_cents").notNull(),
  availableFrom: text("available_from").notNull(),
  leaseEndsAt: text("lease_ends_at").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("pending_review"),
  exposureScore: integer("exposure_score").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  publisherIdx: index("idx_listings_publisher_id").on(table.publisherId),
  browseIdx: index("idx_listings_browse").on(table.city, table.district, table.status),
  dateIdx: index("idx_listings_available_from").on(table.availableFrom),
}));

export const listingDocuments = sqliteTable("listing_documents", {
  id: text("id").primaryKey(),
  listingId: text("listing_id").notNull(),
  ownerId: text("owner_id").notNull(),
  kind: text("kind").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  r2Key: text("r2_key").notNull(),
  processingStatus: text("processing_status").notNull().default("uploaded"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  listingIdx: index("idx_listing_documents_listing_id").on(table.listingId),
  kindIdx: index("idx_listing_documents_kind_status").on(table.kind, table.processingStatus),
}));

export const viewingRequests = sqliteTable("viewing_requests", {
  id: text("id").primaryKey(),
  listingId: text("listing_id").notNull(),
  seekerId: text("seeker_id").notNull(),
  requestedDate: text("requested_date").notNull(),
  requestedTime: text("requested_time").notNull(),
  note: text("note").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  listingIdx: index("idx_viewing_requests_listing_status").on(table.listingId, table.status),
  seekerIdx: index("idx_viewing_requests_seeker_id").on(table.seekerId),
}));

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  listingId: text("listing_id").notNull(),
  senderId: text("sender_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  readAt: text("read_at"),
}, (table) => ({
  conversationIdx: index("idx_messages_conversation").on(table.listingId, table.senderId, table.recipientId, table.createdAt),
}));
