"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "./_components/SiteHeader";
import { toListingView } from "./_lib/listings";
import type { ApiListing, ListingView } from "./_lib/listings";

const districts = ["全部", "南山", "福田", "宝安", "龙华"];

export default function HomeMarketplace() {
  const [listings, setListings] = useState<ListingView[]>([]);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session").then((response) => response.json()).then((payload: { user: { displayName: string } | null }) => setUserName(payload.user?.displayName || null)).catch(() => null);
    fetch("/api/listings").then(async (response) => {
      const payload = await response.json() as { listings?: ApiListing[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "房源加载失败");
      setListings((payload.listings || []).map(toListingView));
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "房源加载失败")).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => listings.filter((item) => {
    const keyword = query.trim().toLowerCase();
    const matchesKeyword = !keyword || `${item.title}${item.district}${item.community}`.toLowerCase().includes(keyword);
    return matchesKeyword && (district === "全部" || item.district === district);
  }), [district, listings, query]);

  return <main className="zuji-page"><SiteHeader active="find" userName={userName} /><section className="zuji-hero"><div className="zuji-container zuji-hero-grid"><div className="zuji-hero-copy"><span className="zuji-kicker">深圳首发 · 真实租客发布</span><h1>找一间<br /><i>真实可查的房子。</i></h1><p>先看位置和价格，再看合同与租赁关系。租迹帮你把最重要的信息放在前面。</p><div className="zuji-search-card"><label><span>你想住在哪里？</span><div><b>⌕</b><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入小区、地铁站或区域" /></div></label><button onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>查看房源 <span>→</span></button></div><div className="zuji-quick"><span>热门区域</span>{districts.slice(1).map((item) => <button key={item} onClick={() => { setDistrict(item); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>{item}</button>)}</div><div className="zuji-safety-note"><span>✓</span><p><b>浏览房源不需要登录</b><small>只有联系发布者或预约看房时才需要登录。</small></p></div></div><div className="zuji-hero-visual"><img src={listings[0]?.image || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=82"} alt="明亮的真实出租房室内" /><div className="zuji-visual-badge"><span>✓</span><p><b>租赁关系已验证</b><small>合同地址与当前房源匹配</small></p></div><div className="zuji-visual-price"><small>南山 · 后海</small><b>¥3,600 <em>/月</em></b></div></div></div></section><section className="zuji-trust" id="trust"><div className="zuji-container"><header><span>为什么可以更放心</span><h2>先看证据，再决定要不要联系。</h2></header><div className="zuji-trust-grid"><article><b>01</b><h3>确认发布者身份</h3><p>实名认证只确认“这个人是谁”，可用于其后续发布。</p></article><article><b>02</b><h3>核对当前房源合同</h3><p>每套房都单独提交合同，避免旧合同被重复用于新房源。</p></article><article><b>03</b><h3>把沟通留在站内</h3><p>先问清租期与室友，不急着交换隐私信息或支付押金。</p></article></div></div></section><section className="zuji-catalog zuji-container" id="listings"><div className="zuji-section-head"><div><span>深圳真实转租</span><h2>先看看，慢慢选。</h2></div><p>{loading ? "正在加载…" : `找到 ${filtered.length} 套房源`}</p></div><div className="zuji-filters" role="group" aria-label="按区域筛选">{districts.map((item) => <button key={item} className={district === item ? "active" : ""} onClick={() => setDistrict(item)}>{item}</button>)}</div>{error ? <div className="zuji-state">{error}</div> : loading ? <div className="zuji-card-grid">{[1,2,3,4].map((item) => <div className="zuji-card-skeleton" key={item} />)}</div> : filtered.length ? <div className="zuji-card-grid">{filtered.map((item) => <ListingCard key={item.id} listing={item} />)}</div> : <div className="zuji-state"><b>暂时没有符合条件的房源</b><span>换一个区域或搜索词试试。</span></div>}</section><section className="zuji-publish-cta"><div className="zuji-container"><div><span>你也有房子需要转租？</span><h2>发布真实信息，找到合适的下一位租客。</h2></div><a href="/publish">开始发布 <span>→</span></a></div></section><footer className="zuji-footer"><div className="zuji-container"><a className="zuji-brand" href="/"><span>租</span><b>租迹 <em>ZUJI</em></b></a><p>让转租回到租客之间。</p><small>© 2026 ZUJI</small></div></footer></main>;
}

function ListingCard({ listing }: { listing: ListingView }) {
  return <a className="zuji-listing-card" href={`/listings/${listing.id}`}><div className="zuji-listing-photo"><img src={listing.image} alt={listing.title} /><span>✓ 合同已匹配</span><button type="button" aria-label="收藏房源" onClick={(event) => { event.preventDefault(); event.currentTarget.classList.toggle("saved"); }}>♡</button></div><div className="zuji-listing-content"><div className="zuji-listing-meta"><span>{listing.district} · {listing.community}</span><span>{listing.availableFrom} 起</span></div><h3>{listing.title}</h3><div className="zuji-listing-tags"><span>身份已验</span><span>租赁关系已验</span></div><div className="zuji-listing-price"><b>¥{listing.price.toLocaleString()}</b><span>/月</span><em>查看详情 →</em></div></div></a>;
}
