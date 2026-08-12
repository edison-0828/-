"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigationSession } from "./_components/NavigationShell";
import Link from "./_components/SafeLink";
import { CITY_GROUPS, POPULAR_CITIES, normalizeChinaCity } from "./_lib/china-cities";
import { getClientCache, setClientCache } from "./_lib/client-cache";
import { toListingView } from "./_lib/listings";
import type { ApiListing, ListingView } from "./_lib/listings";

const rentOptions = [
  { label: "不限价格", value: "all" },
  { label: "3000元内", value: "under3000" },
  { label: "3000–5000元", value: "3000to5000" },
  { label: "5000–8000元", value: "5000to8000" },
  { label: "8000元以上", value: "over8000" },
] as const;

const advantageOptions = [
  { label: "近地铁", value: "metro" },
  { label: "已核验", value: "verified" },
  { label: "预算友好", value: "budget" },
  { label: "近期可住", value: "soon" },
] as const;

const availabilityOptions = [
  { label: "不限入住", value: "all" },
  { label: "现在可住", value: "now" },
  { label: "7天内可住", value: "within7" },
  { label: "30天内可住", value: "within30" },
] as const;

type RentFilter = typeof rentOptions[number]["value"];
type AdvantageFilter = typeof advantageOptions[number]["value"];
type AvailabilityFilter = typeof availabilityOptions[number]["value"];
type SortMode = "recommended" | "priceAsc" | "priceDesc" | "availableAsc" | "districtAsc";
type LocationStatus = "idle" | "locating" | "located" | "manual" | "denied" | "unavailable";

function availableWithin(date: string, days: number) {
  const timestamp = Date.parse(`${date}T00:00:00`);
  if (!Number.isFinite(timestamp)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return timestamp <= today.getTime() + days * 24 * 60 * 60 * 1000;
}

export default function HomeMarketplace() {
  const { user } = useNavigationSession();
  const userName = user === undefined ? undefined : user?.displayName || null;
  const [listings, setListings] = useState<ListingView[]>(() => (getClientCache<ApiListing[]>("public-listings") || []).map(toListingView));
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("全国");
  const [district, setDistrict] = useState("全部");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [cityDraft, setCityDraft] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [rentFilter, setRentFilter] = useState<RentFilter>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [advantages, setAdvantages] = useState<AdvantageFilter[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [loading, setLoading] = useState(() => !getClientCache<ApiListing[]>("public-listings"));
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState("");

  const selectCity = useCallback((value: string, status: LocationStatus = "manual") => {
    const nextCity = value === "全国" ? "全国" : normalizeChinaCity(value);
    if (!nextCity) return;
    setCity(nextCity);
    setDistrict("全部");
    setLocationStatus(status);
    setCityPickerOpen(false);
    setCityDraft("");
    window.localStorage.setItem("zuji-preferred-city", nextCity);
    const url = new URL(window.location.href);
    if (nextCity === "全国") url.searchParams.delete("city"); else url.searchParams.set("city", nextCity);
    url.searchParams.delete("district");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const requestLocation = useCallback(() => {
    setLocationStatus("locating");
    const resolveLocation = async (latitude?: number, longitude?: number) => {
      try {
        const queryString = latitude === undefined || longitude === undefined ? "" : `?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`;
        const response = await fetch(`/api/location${queryString}`, { cache: "no-store" });
        const payload = await response.json() as { city?: string | null };
        if (!response.ok || !payload.city) return false;
        selectCity(payload.city, "located");
        return true;
      } catch {
        return false;
      }
    };
    const resolveByNetwork = async (failureStatus: LocationStatus) => {
      if (!await resolveLocation()) setLocationStatus(failureStatus);
    };

    if (!window.isSecureContext || !navigator.geolocation) {
      void resolveByNetwork("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => void resolveLocation(position.coords.latitude, position.coords.longitude).then((located) => {
        if (!located) void resolveByNetwork("unavailable");
      }),
      (reason) => void resolveByNetwork(reason.code === reason.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 24 * 60 * 60 * 1000 },
    );
  }, [selectCity]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const requestedCity = normalizeChinaCity(parameters.get("city"));
    const storedCity = window.localStorage.getItem("zuji-preferred-city");
    const initialCity = requestedCity || (storedCity ? normalizeChinaCity(storedCity) : "");
    const requestedDistrict = parameters.get("district")?.trim();
    const initializationTimer = window.setTimeout(() => {
      if (initialCity) {
        setCity(initialCity);
        setLocationStatus("manual");
      }
      if (requestedDistrict) setDistrict(requestedDistrict);
    }, 0);
    const locationTimer = !requestedCity && storedCity === null ? window.setTimeout(requestLocation, 280) : undefined;
    return () => {
      window.clearTimeout(initializationTimer);
      if (locationTimer !== undefined) window.clearTimeout(locationTimer);
    };
  }, [requestLocation]);

  useEffect(() => {
    fetch("/api/listings")
      .then(async (response) => {
        const payload = await response.json() as { listings?: ApiListing[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "房源加载失败");
        const items = payload.listings || [];
        setClientCache("public-listings", items);
        items.forEach((item) => setClientCache(`listing:${item.id}`, item));
        setListings(items.map(toListingView));
      })
      .catch((reason: unknown) => {
        if (!getClientCache<ApiListing[]>("public-listings")) setError(reason instanceof Error ? reason.message : "房源加载失败");
      })
      .finally(() => setLoading(false));
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

  useEffect(() => {
    if (!cityPickerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCityPickerOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cityPickerOpen]);

  const publicListings = useMemo(() => listings.filter((item) => item.status !== "pending_review" && item.status !== "rejected"), [listings]);
  const pendingListings = useMemo(() => listings.filter((item) => item.status === "pending_review"), [listings]);
  const cityListings = useMemo(() => publicListings.filter((item) => city === "全国" || item.city === city), [city, publicListings]);
  const districtOptions = useMemo(() => ["全部", ...new Set(cityListings.map((item) => item.district).filter(Boolean))], [cityListings]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const result = cityListings.filter((item) => {
      const searchableText = `${item.title}${item.city}${item.district}${item.community}${item.description || ""}`.toLowerCase();
      const matchesKeyword = !keyword || searchableText.includes(keyword);
      const matchesDistrict = district === "全部" || item.district === district;
      const matchesRent = rentFilter === "all"
        || (rentFilter === "under3000" && item.price < 3000)
        || (rentFilter === "3000to5000" && item.price >= 3000 && item.price <= 5000)
        || (rentFilter === "5000to8000" && item.price > 5000 && item.price <= 8000)
        || (rentFilter === "over8000" && item.price > 8000);
      const matchesAvailability = availabilityFilter === "all"
        || (availabilityFilter === "now" && availableWithin(item.availableFrom, 0))
        || (availabilityFilter === "within7" && availableWithin(item.availableFrom, 7))
        || (availabilityFilter === "within30" && availableWithin(item.availableFrom, 30));
      const matchesAdvantages = advantages.every((advantage) => {
        if (advantage === "metro") return searchableText.includes("地铁");
        if (advantage === "verified") return item.status === "published";
        if (advantage === "budget") return item.price < 4000;
        return availableWithin(item.availableFrom, 30);
      });
      return matchesKeyword && matchesDistrict && matchesRent && matchesAvailability && matchesAdvantages;
    });
    if (sortMode === "recommended") return result;
    return [...result].sort((a, b) => {
      if (sortMode === "priceAsc") return a.price - b.price;
      if (sortMode === "priceDesc") return b.price - a.price;
      if (sortMode === "districtAsc") return `${a.district}${a.community}`.localeCompare(`${b.district}${b.community}`, "zh-CN");
      return a.availableFrom.localeCompare(b.availableFrom);
    });
  }, [advantages, availabilityFilter, cityListings, district, query, rentFilter, sortMode]);

  const chooseDistrict = (value: string) => {
    setDistrict(value);
    const url = new URL(window.location.href);
    if (value === "全部") url.searchParams.delete("district"); else url.searchParams.set("district", value);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const toggleAdvantage = (value: AdvantageFilter) => {
    setAdvantages((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const clearFilters = () => {
    setQuery("");
    setRentFilter("all");
    setAvailabilityFilter("all");
    setAdvantages([]);
    setSortMode("recommended");
    chooseDistrict("全部");
  };

  const submitCityDraft = () => {
    const nextCity = normalizeChinaCity(cityDraft);
    if (nextCity) selectCity(nextCity);
  };

  const locationCopy = locationStatus === "locating"
    ? "正在获取你的位置…"
    : locationStatus === "located"
      ? "已定位 · 真实租客转租"
      : locationStatus === "denied"
        ? "定位未授权 · 可手动选择"
        : locationStatus === "unavailable"
          ? "定位不可用 · 可手动选择"
          : city === "全国" ? "全国真实租客转租" : "真实租客转租";
  const hasActiveFilters = Boolean(query || district !== "全部" || rentFilter !== "all" || availabilityFilter !== "all" || advantages.length || sortMode !== "recommended");

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

  return <main className="zuji-page zuji-find-page">
    <section className="zuji-find-hero"><div className="zuji-container">
      <div className="zuji-find-location"><button type="button" onClick={() => setCityPickerOpen(true)} aria-haspopup="dialog"><span>{city}</span><i aria-hidden="true">⌄</i></button><b>{locationCopy}</b></div>
      <h1>找到一间，<em>信息清楚的房子</em></h1>
      <p>价格、入住时间和租约核验结果都放在明面上，先看合不合适，再联系发布者。</p>
      <div className="zuji-find-search"><span aria-hidden="true">⌕</span><input aria-label="搜索房源" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") jumpToListings(); }} placeholder="搜索城市、小区、区域或地铁站" />{query && <button className="clear" onClick={() => setQuery("")} aria-label="清空搜索">×</button>}<button className="search" onClick={jumpToListings}>搜索房源</button></div>
      <div className="zuji-find-assurance"><span>✓ 发布账号可确认</span><span>✓ 每套房单独核验租约</span><span>✓ 浏览房源无需登录</span></div>
    </div></section>

    <section className="zuji-find-catalog zuji-container" id="listings">
      <header className="zuji-find-section-head"><div><span>{city === "全国" ? "全国转租房源" : `${city}转租房源`}</span><h2>看看最近有哪些好房</h2></div><p>{loading ? "正在更新房源…" : `共 ${cityListings.length} 套公开房源`}</p></header>

      {pendingListings.length > 0 && <Link className="zuji-my-pending" href="/publish"><span>⌛</span><p><b>你有 {pendingListings.length} 套房源正在审核</b><small>审核中的房源不会展示在公开找房列表</small></p><em>查看发布 →</em></Link>}

      <div className="zuji-find-filterbar">
        <div className="zuji-find-advantages"><span>房源优势</span><div role="group" aria-label="按房源优势筛选"><button aria-pressed={!advantages.length} className={!advantages.length ? "active" : ""} onClick={() => setAdvantages([])}>不限</button>{advantageOptions.map((item) => <button key={item.value} aria-pressed={advantages.includes(item.value)} className={advantages.includes(item.value) ? "active" : ""} onClick={() => toggleAdvantage(item.value)}>{item.label}</button>)}</div></div>
        <div className="zuji-find-selects zuji-find-filter-selects">
          <label><span>区域</span><select aria-label="按区域筛选" disabled={city === "全国"} value={district} onChange={(event) => chooseDistrict(event.target.value)}><option value="全部">{city === "全国" ? "先选择城市" : "全部区域"}</option>{districtOptions.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span>价格</span><select aria-label="按租金筛选" value={rentFilter} onChange={(event) => setRentFilter(event.target.value as RentFilter)}>{rentOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>入住</span><select aria-label="按入住时间筛选" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}>{availabilityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>排序</span><select aria-label="房源排序" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="recommended">推荐排序</option><option value="priceAsc">租金从低到高</option><option value="priceDesc">租金从高到低</option><option value="availableAsc">最早可入住</option><option value="districtAsc">区域名称排序</option></select></label>
        </div>
      </div>

      <div className="zuji-find-result-head"><span>{loading ? "正在加载…" : `找到 ${filtered.length} 套房源`}</span>{hasActiveFilters && <button onClick={clearFilters}>清除条件</button>}</div>

      {error ? <div className="zuji-find-state"><b>暂时无法加载房源</b><span>{error}</span></div> : loading ? <div className="zuji-find-list">{[1,2,3,4].map((item) => <div className="zuji-find-skeleton" key={item} />)}</div> : filtered.length ? <div className="zuji-find-list">{filtered.map((item) => <ListingCard key={item.id} listing={item} saved={savedIds.has(item.id)} busy={favoriteBusyId === item.id} onToggleFavorite={toggleFavorite} />)}</div> : <div className="zuji-find-state"><b>{city === "全国" ? "没有找到符合条件的房源" : `${city}暂时没有匹配房源`}</b><span>试试放宽优势、区域、价格或入住时间。</span><button onClick={() => { clearFilters(); if (city !== "全国") selectCity("全国"); }}>{city === "全国" ? "清除筛选" : "查看全国房源"}</button></div>}
      {!loading && !error && filtered.length > 0 && <div className="zuji-find-list-end"><span /><p><b>已经到底</b><small>新房源会持续更新</small></p><span /></div>}
    </section>

    {cityPickerOpen && <div className="zuji-city-backdrop" onClick={() => setCityPickerOpen(false)}><section className="zuji-city-picker" role="dialog" aria-modal="true" aria-labelledby="zuji-city-title" onClick={(event) => event.stopPropagation()}>
      <header><div><span>切换城市</span><h2 id="zuji-city-title">你想在哪里找房？</h2><p>可选择常用城市，也可以输入全国任意城市。</p></div><button type="button" onClick={() => setCityPickerOpen(false)} aria-label="关闭城市选择">×</button></header>
      <button className="zuji-city-locate" type="button" disabled={locationStatus === "locating"} onClick={requestLocation}><i aria-hidden="true">⌖</i><span><b>{locationStatus === "locating" ? "正在定位…" : "使用当前位置"}</b><small>仅用于匹配附近城市，不保存精确坐标</small></span><em>→</em></button>
      <form onSubmit={(event) => { event.preventDefault(); submitCityDraft(); }}><input autoFocus aria-label="输入城市名称" value={cityDraft} onChange={(event) => setCityDraft(event.target.value)} placeholder="输入城市，例如：成都" maxLength={18} /><button type="submit" disabled={!cityDraft.trim()}>确定</button></form>
      <div className="zuji-city-popular"><span>热门城市</span><div><button type="button" className={city === "全国" ? "active" : ""} onClick={() => selectCity("全国")}>全国</button>{POPULAR_CITIES.map((item) => <button type="button" className={city === item ? "active" : ""} key={item} onClick={() => selectCity(item)}>{item}</button>)}</div></div>
      <div className="zuji-city-groups">{CITY_GROUPS.map((group) => <div key={group.region}><b>{group.region}</b><p>{group.cities.map((item) => <button type="button" className={city === item ? "active" : ""} key={item} onClick={() => selectCity(item)}>{item}</button>)}</p></div>)}</div>
    </section></div>}

    <section className="zuji-find-publish zuji-container"><div><span>你也有房子需要转租？</span><h2>用几分钟讲清楚房源，找到合适的下一位租客。</h2></div><Link href="/publish">发布转租 <span>→</span></Link></section>
    <footer className="zuji-new-footer"><div className="zuji-container"><Link className="zuji-brand" href="/"><span>租</span><b>租迹 <em>ZUJI</em></b></Link><p>让转租回到租客之间。</p><small>© 2026 ZUJI</small></div></footer>
  </main>;
}

function ListingCard({ listing, saved, busy, onToggleFavorite }: { listing: ListingView; saved: boolean; busy: boolean; onToggleFavorite: (listingId: string) => void }) {
  const tags = [listing.title.includes("地铁") ? "近地铁" : "租约已核验", listing.price < 4000 ? "预算友好" : "真实租客发布"];
  return <article className="zuji-find-card"><Link href={`/listings/${listing.id}`} className="zuji-find-card-link"><div className="zuji-find-card-photo"><img src={listing.image} alt={listing.title} /><span>✓ 本套租约已核验</span></div><div className="zuji-find-card-content"><div className="zuji-find-card-place">{listing.city} · {listing.district} · {listing.community}</div><h3>{listing.title}</h3><p className="zuji-find-card-desc">{listing.description || "房源由真实租客发布，可在站内进一步确认室友、家具和看房时间。"}</p><div className="zuji-find-card-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="zuji-find-card-foot"><span>{listing.availableFrom} 起可入住</span><strong>¥{listing.price.toLocaleString()}<em>/月</em></strong></div></div></Link><button className={`zuji-find-save ${saved ? "saved" : ""}`} disabled={busy} aria-label={saved ? "取消收藏" : "收藏房源"} aria-pressed={saved} onClick={() => onToggleFavorite(listing.id)}>{saved ? "♥" : "♡"}</button></article>;
}
