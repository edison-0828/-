"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "../_components/SafeLink";
import { normalizeChinaCity } from "../_lib/china-cities";
import { getClientCache, setClientCache } from "../_lib/client-cache";
import type { ApiListing } from "../_lib/listings";

const rentBands = [
  { label: "3500 元以内", min: 0, max: 3500 },
  { label: "3500–4500 元", min: 3500, max: 4500 },
  { label: "4500–5500 元", min: 4500, max: 5500 },
  { label: "5500 元以上", min: 5500, max: Number.POSITIVE_INFINITY },
];
const recentDeals = [
  { orderNo: "ZJ26081201", city: "深圳", district: "南山", community: "科技园片区", monthlyRent: 5200, askingRent: 5500, leaseMonths: 8, cycleDays: 3, completedAt: "2026-08-12T10:26:00+08:00", dateLabel: "08月12日", timeLabel: "10:26" },
  { orderNo: "ZJ26081103", city: "深圳", district: "福田", community: "车公庙片区", monthlyRent: 4600, askingRent: 4800, leaseMonths: 6, cycleDays: 5, completedAt: "2026-08-11T18:42:00+08:00", dateLabel: "08月11日", timeLabel: "18:42" },
  { orderNo: "ZJ26081002", city: "深圳", district: "宝安", community: "西乡片区", monthlyRent: 3850, askingRent: 4000, leaseMonths: 9, cycleDays: 2, completedAt: "2026-08-10T15:08:00+08:00", dateLabel: "08月10日", timeLabel: "15:08" },
  { orderNo: "ZJ26080904", city: "深圳", district: "龙华", community: "红山片区", monthlyRent: 4300, askingRent: 4500, leaseMonths: 12, cycleDays: 4, completedAt: "2026-08-09T20:16:00+08:00", dateLabel: "08月09日", timeLabel: "20:16" },
];

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export default function MarketTrendsClient() {
  const [city, setCity] = useState("全国");
  const [listings, setListings] = useState<ApiListing[] | null>(() => {
    const cached = getClientCache<ApiListing[]>("public-listings");
    return cached ? cached.filter((listing) => listing.status === "published") : null;
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedCity = normalizeChinaCity(new URLSearchParams(window.location.search).get("city"));
    const preferredCity = normalizeChinaCity(window.localStorage.getItem("zuji-preferred-city"));
    const cityTimer = window.setTimeout(() => setCity(requestedCity || preferredCity || "全国"), 0);
    return () => window.clearTimeout(cityTimer);
  }, []);

  useEffect(() => {
    fetch("/api/listings", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { listings?: ApiListing[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "行情加载失败");
        const items = payload.listings || [];
        setClientCache("public-listings", items);
        items.forEach((item) => setClientCache(`listing:${item.id}`, item));
        setListings(items.filter((listing) => listing.status === "published"));
      })
      .catch((reason: unknown) => {
        const cached = getClientCache<ApiListing[]>("public-listings");
        if (cached) {
          setListings(cached.filter((listing) => listing.status === "published"));
          return;
        }
        setError(reason instanceof Error ? reason.message : "行情加载失败");
        setListings([]);
      });
  }, []);

  const snapshot = useMemo(() => {
    const publicListings = listings || [];
    const selectedListings = city === "全国" ? publicListings : publicListings.filter((listing) => listing.city === city);
    const rents = selectedListings.map((listing) => listing.monthlyRentCents / 100).filter((rent) => rent > 0);
    const areaNames = [...new Set(selectedListings.map((listing) => city === "全国" ? listing.city : listing.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const areaRows = areaNames.map((area) => {
      const areaRents = selectedListings
        .filter((listing) => (city === "全国" ? listing.city : listing.district) === area)
        .map((listing) => listing.monthlyRentCents / 100)
        .filter((rent) => rent > 0);
      return {
        area,
        count: areaRents.length,
        average: average(areaRents),
        median: median(areaRents),
        minimum: areaRents.length ? Math.min(...areaRents) : 0,
        maximum: areaRents.length ? Math.max(...areaRents) : 0,
      };
    });
    const maxAverage = Math.max(...areaRows.map((row) => row.average), 1);
    const bands = rentBands.map((band) => {
      const count = rents.filter((rent) => rent >= band.min && rent < band.max).length;
      return { ...band, count, ratio: rents.length ? Math.round(count / rents.length * 100) : 0 };
    });
    return { count: rents.length, average: average(rents), median: median(rents), areaRows, maxAverage, bands };
  }, [city, listings]);

  const visibleDeals = city === "全国" ? recentDeals : recentDeals.filter((deal) => deal.city === city);

  return <section className="zuji-market-page zuji-container">
    <header className="zuji-market-hero">
      <div><span>{city}租房行情</span><h1>{city === "全国" ? "不同城市租金，" : "各区租金，"}<br />先看清再找房。</h1><p>基于租迹当前公开转租房源，查看挂牌月租、样本数量和价格分布。</p></div>
      <div className="zuji-market-summary">
        <div><small>公开样本</small><strong>{listings === null ? "—" : snapshot.count}<em> 套</em></strong></div>
        <div><small>样本均价</small><strong>{snapshot.average ? `¥${snapshot.average.toLocaleString()}` : "—"}<em> /月</em></strong></div>
        <div><small>中位月租</small><strong>{snapshot.median ? `¥${snapshot.median.toLocaleString()}` : "—"}<em> /月</em></strong></div>
      </div>
    </header>

    <div className="zuji-market-note"><b>数据口径</b><p>这是平台当前公开房源的挂牌租金快照，不代表官方统计或最终成交价；样本越多，参考价值越高。</p></div>

    <section className="zuji-market-section zuji-market-deals">
      <header><div><span>近期成交</span><h2>最近成交的订单</h2></div><p><b>DEMO</b> 隐私处理后的示例成交记录</p></header>
      <div className="zuji-market-deal-list">
        <div className="zuji-market-deal-columns" aria-hidden="true"><span>成交房源</span><span>成交月租</span><span>价格变化</span><span>租期</span><span>成交时间</span><span>状态</span></div>
        {visibleDeals.map((deal) => <article className="zuji-market-deal-row" key={deal.orderNo}>
          <div className="zuji-market-deal-home"><i aria-hidden="true">✓</i><p><b>{city === "全国" ? `${deal.city} · ` : ""}{deal.district} · {deal.community}</b><small>订单 {deal.orderNo}</small></p></div>
          <strong className="zuji-market-deal-price">¥{deal.monthlyRent.toLocaleString()}<small>/月</small></strong>
          <div className="zuji-market-deal-gap"><b>低于挂牌 ¥{(deal.askingRent - deal.monthlyRent).toLocaleString()}</b><small>挂牌 ¥{deal.askingRent.toLocaleString()}/月</small></div>
          <span className="zuji-market-deal-lease">{deal.leaseMonths} 个月</span>
          <time className="zuji-market-deal-time" dateTime={deal.completedAt}><b>{deal.dateLabel}</b><small>{deal.timeLabel} · {deal.cycleDays} 天成交</small></time>
          <em className="zuji-market-deal-status">已成交</em>
        </article>)}
        {!visibleDeals.length && <div className="zuji-market-deal-empty"><b>{city}暂无成交样本</b><span>成交确认功能接入后会自动更新。</span></div>}
      </div>
      <footer className="zuji-market-deal-note"><span>成交价仅展示签约月租，不含押金、水电等费用。</span><b>正式接入成交确认后自动更新</b></footer>
    </section>

    {error ? <div className="zuji-profile-error"><b>行情暂时无法加载</b><p>{error}</p><button onClick={() => window.location.reload()}>重新加载</button></div> : listings === null ? <div className="zuji-market-loading"><span /><span /><span /><span /></div> : <>
      <section className="zuji-market-section">
        <header><div><span>{city === "全国" ? "城市对比" : "区域对比"}</span><h2>{city === "全国" ? "全国各城市挂牌月租" : `${city}各区挂牌月租`}</h2></div><p>点击即可查看对应房源</p></header>
        <div className="zuji-market-districts">
          {snapshot.areaRows.map((row) => <article className={row.count ? "" : "empty"} key={row.area}>
            <header><div><span>{row.area}</span><small>{row.count ? `${row.count} 套样本` : "暂无样本"}</small></div><strong>{row.average ? `¥${row.average.toLocaleString()}` : "—"}<em>/月</em></strong></header>
            <div className="zuji-market-bar"><i style={{ width: row.average ? `${Math.max(12, row.average / snapshot.maxAverage * 100)}%` : "0%" }} /></div>
            <p><span>中位数 <b>{row.median ? `¥${row.median.toLocaleString()}` : "—"}</b></span><span>区间 <b>{row.count ? `¥${row.minimum.toLocaleString()}–${row.maximum.toLocaleString()}` : "—"}</b></span></p>
            <Link href={city === "全国" ? `/?city=${encodeURIComponent(row.area)}#listings` : `/?city=${encodeURIComponent(city)}&district=${encodeURIComponent(row.area)}#listings`}>查看{row.area}房源 <b>→</b></Link>
          </article>)}
          {!snapshot.areaRows.length && <div className="zuji-market-area-empty"><b>{city}暂无公开房源样本</b><Link href="/">返回全国找房 →</Link></div>}
        </div>
      </section>

      <section className="zuji-market-section zuji-market-bands">
        <header><div><span>价格分布</span><h2>当前房源集中在哪个价位</h2></div></header>
        <div>{snapshot.bands.map((band) => <article key={band.label}><header><b>{band.label}</b><span>{band.count} 套 · {band.ratio}%</span></header><div><i style={{ width: `${band.ratio}%` }} /></div></article>)}</div>
      </section>
    </>}
  </section>;
}
