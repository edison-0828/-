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
  assert.match(marketplace, /zuji-find-list-end/);
  assert.match(marketplace, /zuji-city-picker/);
  assert.match(marketplace, /advantageOptions\.map/);
  assert.match(marketplace, /按入住时间筛选/);
  assert.match(marketplace, /districtAsc/);
  assert.match(marketplace, /看看最近有哪些好房/);
});

test("supports nationwide city selection, location matching, and city-aware publishing", async () => {
  const [marketplace, locationRoute, cities, listingsRoute, publisher] = await Promise.all([
    read("app/HomeMarketplace.tsx"),
    read("app/api/location/route.ts"),
    read("app/_lib/china-cities.ts"),
    read("app/api/listings/route.ts"),
    read("app/PublisherWorkspace.tsx"),
  ]);

  assert.match(marketplace, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(marketplace, /zuji-preferred-city/);
  assert.match(marketplace, /CITY_GROUPS\.map/);
  assert.match(locationRoute, /nearestChinaCity/);
  assert.match(cities, /region: "港澳台"/);
  assert.match(listingsRoute, /textField\(form, "city"\)/);
  assert.match(listingsRoute, /city === "全国"/);
  assert.match(publisher, /body\.set\("city"/);
  assert.match(publisher, /房源所在的具体城市/);
});

test("keeps messaging, unread notifications, and viewing decisions connected", async () => {
  const [messagesRoute, notificationsRoute, viewingRoute, profile, shell, schema, migration] = await Promise.all([
    read("app/api/messages/route.ts"),
    read("app/api/notifications/route.ts"),
    read("app/api/viewing-requests/[id]/route.ts"),
    read("app/profile/ProfileDashboard.tsx"),
    read("app/_components/NavigationShell.tsx"),
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
  assert.match(shell, /zuji:notifications-changed/);
  assert.match(schema, /publisherNote/);
  assert.match(migration, /publisher_note/);
});

test("falls back to full navigation on insecure LAN previews", async () => {
  const [safeLink, shell] = await Promise.all([
    read("app/_components/SafeLink.tsx"),
    read("app/_components/NavigationShell.tsx"),
  ]);

  assert.match(safeLink, /globalThis\.crypto\?\.subtle/);
  assert.match(safeLink, /window\.location\.assign/);
  assert.match(safeLink, /destination\.origin !== window\.location\.origin/);
  assert.match(shell, /returnTo\?\.startsWith\("\/"\)/);
  assert.match(shell, /pendingDestination \|\| currentDestination/);
});

test("keeps navigation persistent and gives route changes immediate feedback", async () => {
  const [layout, shell, safeLink, loading, styles] = await Promise.all([
    read("app/layout.tsx"),
    read("app/_components/NavigationShell.tsx"),
    read("app/_components/SafeLink.tsx"),
    read("app/loading.tsx"),
    read("app/marketplace.css"),
  ]);

  assert.match(layout, /<NavigationShell initialUser=\{initialUser\}>/);
  assert.match(shell, /<BottomNavigation active=\{activeDestination\}/);
  assert.match(shell, /zuji-route-progress/);
  assert.match(shell, /router\.push/);
  assert.match(shell, /routeDirectionBetween/);
  assert.match(shell, /setAnimateArrivedRoute\(true\)/);
  assert.match(safeLink, /ROUTE_START_EVENT/);
  assert.match(loading, /zuji-route-loading/);
  assert.match(styles, /Persistent navigation shell and quick route feedback/);
  assert.match(styles, /zuji-ios-route-forward/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
});

test("keeps the nationwide market entry in global navigation", async () => {
  const [navigation, market] = await Promise.all([
    read("app/_components/BottomNavigation.tsx"),
    read("app/market/MarketTrendsClient.tsx"),
  ]);

  assert.match(navigation, /href="\/market"/);
  assert.match(navigation, />行情</);
  assert.doesNotMatch(navigation, />消息<\/b>/);
  assert.match(market, /\{city\}租房行情/);
  assert.match(market, /不代表官方统计或最终成交价/);
  assert.match(market, /最近成交的订单/);
  assert.match(market, /visibleDeals\.map/);
  assert.match(market, /示例成交记录/);
  assert.match(market, /snapshot\.areaRows\.map/);
});
