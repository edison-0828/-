import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("keeps the marketplace shell and Chinese metadata wired", async () => {
  const [page, layout, marketplace] = await Promise.all([
    read("app/page.tsx"),
    read("app/layout.tsx"),
    read("app/HomeMarketplace.tsx"),
  ]);

  assert.match(page, /<HomeMarketplace\s*\/>/);
  assert.match(layout, /export const metadata:\s*Metadata/);
  assert.match(layout, /lang="zh-CN"/);
  assert.match(marketplace, /\/api\/listings/);
  assert.match(marketplace, /看看最近有哪些好房/);
});

test("keeps messaging, unread notifications, and viewing decisions connected", async () => {
  const [messagesRoute, notificationsRoute, viewingRoute, profile, header, schema, migration] = await Promise.all([
    read("app/api/messages/route.ts"),
    read("app/api/notifications/route.ts"),
    read("app/api/viewing-requests/[id]/route.ts"),
    read("app/profile/ProfileDashboard.tsx"),
    read("app/_components/SiteHeader.tsx"),
    read("db/schema.ts"),
    read("drizzle/0002_amazing_mandroid.sql"),
  ]);

  assert.match(messagesRoute, /export async function GET/);
  assert.match(messagesRoute, /export async function POST/);
  assert.match(messagesRoute, /export async function PATCH/);
  assert.match(messagesRoute, /readAt:\s*sql`CURRENT_TIMESTAMP`/);
  assert.match(notificationsRoute, /unreadMessages/);
  assert.match(notificationsRoute, /pendingViewings/);
  assert.match(viewingRoute, /"confirm"/);
  assert.match(viewingRoute, /"reject"/);
  assert.match(viewingRoute, /"reschedule"/);
  assert.match(profile, /确认时间/);
  assert.match(profile, /发送新时间/);
  assert.match(header, /zuji:notifications-changed/);
  assert.match(schema, /publisherNote/);
  assert.match(migration, /publisher_note/);
});

test("falls back to full navigation on insecure LAN previews", async () => {
  const safeLink = await read("app/_components/SafeLink.tsx");

  assert.match(safeLink, /globalThis\.crypto\?\.subtle/);
  assert.match(safeLink, /window\.location\.assign/);
  assert.match(safeLink, /destination\.origin !== window\.location\.origin/);
});

test("keeps the public district market entry in global navigation", async () => {
  const [navigation, market] = await Promise.all([
    read("app/_components/BottomNavigation.tsx"),
    read("app/market/MarketTrendsClient.tsx"),
  ]);

  assert.match(navigation, /href="\/market"/);
  assert.match(navigation, />行情</);
  assert.doesNotMatch(navigation, />消息<\/b>/);
  assert.match(market, /深圳租房行情/);
  assert.match(market, /不代表官方统计或最终成交价/);
  assert.match(market, /最近成交的订单/);
  assert.match(market, /recentDeals\.map/);
  assert.match(market, /示例成交记录/);
  assert.match(market, /districts\.map/);
});
