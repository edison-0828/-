"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "./_components/SiteHeader";
import Link from "./_components/SafeLink";
import { toListingView } from "./_lib/listings";
import type { ApiListing, ListingView } from "./_lib/listings";

const districts = ["全部", "南山", "福田", "宝安", "龙华"];
const rentOptions = [
  { label: "不限租金", value: "all" },
  { label: "4000元内", value: "under4000" },
  { label: "4000–5000元", value: "4000to5000" },
  { label: "5000元以上", value: "over5000" },
] as const;

type RentFilter = typeof rentOptions[number]["value"];
type SortMode = "latest" | "priceAsc" | "priceDesc";

export default function HomeMarketplace() {
  const [listings, setListings] = useState<ListingView[]>([]);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("全部");
  const [rentFilter, setRentFilter] = useState<RentFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | null | undefined>(undefined);
  const [authMethod, setAuthMethod] = useState<"chatgpt" | "demo" | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState("");

  useEffect(() => {
    const requestedDistrict = new URLSearchParams(window.location.search).get("district");
    const districtTimer = requestedDistrict && districts.includes(requestedDistrict)
      ? window.setTimeout(() => setDistrict(requestedDistrict), 0)
      : undefined;

    fetch("/api/session")
      .then((response) => response.json())
      .then((payload: { user: { displayName: string; authMethod: "chatgpt" | "demo" } | null }) => { setUserName(payload.user?.displayName || null); setAuthMethod(payload.user?.authMethod || null); })
      .catch(() => setUserName(null));

    fetch("/api/listings")
      .then(async (response) => {
        const payload = await response.json() as { listings?: ApiListing[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "房源加载失败");
        setListings((payload.listings || []).map(toListingView));
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "房源加载失败"))
      .finally(() => setLoading(false));
    return () => {
      if (districtTimer !== undefined) window.clearTimeout(districtTimer);
    };
  }, []);

  useEffect(() => {
    if (!userName) {
      if (userName !== null) return;
      const clearTimer = window.setTimeout(() => setSavedIds(new Set()), 0);
      return () => window.clearTimeout(clearTimer);
    }
    fetch("/api/favorites")
      .then((response) => response.json())
      .then((payload: { favoriteIds?: string[] }) => setSavedIds(new Set(payload.favoriteIds || [])))
      .catch(() => setSavedIds(new Set()));
  }, [userName]);

  const publicListings = useMemo(() => listings.filter((item) => item.status !== "pending_review" && item.status !== "rejected"), [listings]);
  const pendingListings = useMemo(() => listings.filter((item) => item.status === "pending_review"), [listings]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const result = publicListings.filter((item) => {
      const matchesKeyword = !keyword || `${item.title}${item.district}${item.community}${item.description || ""}`.toLowerCase().includes(keyword);
      const matchesDistrict = district === "全部" || item.district === district;
      const matchesRent = rentFilter === "all"
        || (rentFilter === "under4000" && item.price < 4000)
        || (rentFilter === "4000to5000" && item.price >= 4000 && item.price <= 5000)
        || (rentFilter === "over5000" && item.price > 5000);
      return matchesKeyword && matchesDistrict && matchesRent;
    });
    return [...result].sort((a, b) => sortMode === "priceAsc" ? a.price - b.price : sortMode === "priceDesc" ? b.price - a.price : b.availableFrom.localeCompare(a.availableFrom));
  }, [district, publicListings, query, rentFilter, sortMode]);

  const chooseDistrict = (value: string) => {
    setDistrict(value);
    const url = new URL(window.location.href);
    if (value === "全部") url.searchParams.delete("district"); else url.searchParams.set("district", value);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const jumpToListings = () => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const toggleFavorite = async (listingId: string) => {
    if (userName === undefined || favoriteBusyId) return;
    if (!userName) {
      window.location.href = "/login?return_to=%2F%23listings";
      return;
    }

    const wasSaved = savedIds.has(listingId);
    setFavoriteBusyId(listingId);
    setSavedIds((current) => { const next = new Set(current); if (wasSaved) next.delete(listingId); else next.add(listingId); return next; });
    try {
      const response = await fetch(wasSaved ? `/api/favorites?listingId=${encodeURIComponent(listingId)}` : "/api/favorites", {
        method: wasSaved ? "DELETE" : "POST",
        headers: wasSaved ? undefined : { "content-type": "application/json" },
        body: wasSaved ? undefined : JSON.stringify({ listingId }),
      });
      if (response.status === 401) {
        window.location.href = "/login?return_to=%2F%23listings";
        return;
      }
      if (!response.ok) throw new Error("收藏操作失败");
    } catch {
      setSavedIds((current) => { const next = new Set(current); if (wasSaved) next.add(listingId); else next.delete(listingId); return next; });
    } finally {
      setFavoriteBusyId("");
    }
  };

  return <main className="zuji-page zuji-find-page"><SiteHeader active="find" userName={userName} authMethod={authMethod} />
    <section className="zuji-find-hero"><div className="zuji-container">
      <div className="zuji-find-location"><span>深圳</span><b>真实租客转租</b></div>
      <h1>找到一间，<em>信息清楚的房子</em></h1>
      <p>价格、入住时间和租约核验结果都放在明面上，先看合不合适，再联系发布者。</p>
      <div className="zuji-find-search"><span aria-hidden="true">⌕</span><input aria-label="搜索房源" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") jumpToListings(); }} placeholder="搜索小区、区域或地铁站" />{query && <button className="clear" onClick={() => setQuery("")} aria-label="清空搜索">×</button>}<button className="search" onClick={jumpToListings}>搜索房源</button></div>
      <div className="zuji-find-shortcuts" aria-label="快捷找房">
        <button onClick={() => { chooseDistrict("南山"); jumpToListings(); }}><span>南</span><b>南山房源</b><small>科技园 · 后海</small></button>
        <button onClick={() => { chooseDistrict("福田"); jumpToListings(); }}><span>福</span><b>福田房源</b><small>车公庙 · 会展中心</small></button>
        <button onClick={() => { setRentFilter("under4000"); jumpToListings(); }}><span>¥</span><b>预算友好</b><small>月租 4000 元内</small></button>
        <button onClick={() => { setQuery("地铁"); jumpToListings(); }}><span>铁</span><b>近地铁</b><small>通勤更方便</small></button>
      </div>
      <div className="zuji-find-assurance"><span>✓ 发布账号可确认</span><span>✓ 每套房单独核验租约</span><span>✓ 浏览房源无需登录</span></div>
    </div></section>

    <section className="zuji-find-catalog zuji-container" id="listings">
      <header className="zuji-find-section-head"><div><span>深圳转租房源</span><h2>看看最近有哪些好房</h2></div><p>{loading ? "正在更新房源…" : `共 ${publicListings.length} 套公开房源`}</p></header>

      {pendingListings.length > 0 && <Link className="zuji-my-pending" href="/publish"><span>⌛</span><p><b>你有 {pendingListings.length} 套房源正在审核</b><small>审核中的房源不会展示在公开找房列表</small></p><em>查看发布 →</em></Link>}

      <div className="zuji-find-filterbar">
        <div className="zuji-find-districts" role="group" aria-label="按区域筛选">{districts.map((item) => <button key={item} aria-pressed={district === item} className={district === item ? "active" : ""} onClick={() => chooseDistrict(item)}>{item}</button>)}</div>
        <div className="zuji-find-selects"><select aria-label="按租金筛选" value={rentFilter} onChange={(event) => setRentFilter(event.target.value as RentFilter)}>{rentOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="房源排序" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="latest">最近可入住</option><option value="priceAsc">租金从低到高</option><option value="priceDesc">租金从高到低</option></select></div>
      </div>

      <div className="zuji-find-result-head"><span>{loading ? "正在加载…" : `找到 ${filtered.length} 套房源`}</span>{(query || district !== "全部" || rentFilter !== "all") && <button onClick={() => { setQuery(""); setRentFilter("all"); chooseDistrict("全部"); }}>清除条件</button>}</div>

      {error ? <div className="zuji-find-state"><b>暂时无法加载房源</b><span>{error}</span></div> : loading ? <div className="zuji-find-list">{[1,2,3,4].map((item) => <div className="zuji-find-skeleton" key={item} />)}</div> : filtered.length ? <div className="zuji-find-list">{filtered.map((item) => <ListingCard key={item.id} listing={item} saved={savedIds.has(item.id)} busy={favoriteBusyId === item.id} onToggleFavorite={toggleFavorite} />)}</div> : <div className="zuji-find-state"><b>没有找到符合条件的房源</b><span>试试放宽区域、租金或搜索条件。</span><button onClick={() => { setQuery(""); setRentFilter("all"); chooseDistrict("全部"); }}>查看全部房源</button></div>}
    </section>

    <section className="zuji-find-trust" id="trust"><div className="zuji-container"><div><span>租迹的不同</span><h2>不只展示房源，<br />也说明它为什么可信。</h2></div><div className="zuji-find-trust-items"><article><b>01</b><h3>确认发布账号</h3><p>让沟通有清晰起点，个人证件不会公开展示。</p></article><article><b>02</b><h3>核对本套租约</h3><p>每套新房源都要重新匹配对应合同。</p></article><article><b>03</b><h3>先站内沟通</h3><p>看房前不转账，不急着交换隐私信息。</p></article></div></div></section>
    <section className="zuji-find-publish zuji-container"><div><span>你也有房子需要转租？</span><h2>用几分钟讲清楚房源，找到合适的下一位租客。</h2></div><Link href="/publish">发布转租 <span>→</span></Link></section>
    <footer className="zuji-new-footer"><div className="zuji-container"><Link className="zuji-brand" href="/"><span>租</span><b>租迹 <em>ZUJI</em></b></Link><p>让转租回到租客之间。</p><small>© 2026 ZUJI</small></div></footer>
  </main>;
}

function ListingCard({ listing, saved, busy, onToggleFavorite }: { listing: ListingView; saved: boolean; busy: boolean; onToggleFavorite: (listingId: string) => void }) {
  const tags = [listing.title.includes("地铁") ? "近地铁" : "租约已核验", listing.price < 4000 ? "预算友好" : "真实租客发布"];
  return <article className="zuji-find-card"><Link href={`/listings/${listing.id}`} className="zuji-find-card-link"><div className="zuji-find-card-photo"><img src={listing.image} alt={listing.title} /><span>✓ 本套租约已核验</span></div><div className="zuji-find-card-content"><div className="zuji-find-card-place">{listing.district} · {listing.community}</div><h3>{listing.title}</h3><p className="zuji-find-card-desc">{listing.description || "房源由真实租客发布，可在站内进一步确认室友、家具和看房时间。"}</p><div className="zuji-find-card-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="zuji-find-card-foot"><span>{listing.availableFrom} 起可入住</span><strong>¥{listing.price.toLocaleString()}<em>/月</em></strong></div></div></Link><button className={`zuji-find-save ${saved ? "saved" : ""}`} disabled={busy} aria-label={saved ? "取消收藏" : "收藏房源"} aria-pressed={saved} onClick={() => onToggleFavorite(listing.id)}>{saved ? "♥" : "♡"}</button></article>;
}
