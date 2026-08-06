"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "./_components/SiteHeader";
import { toListingView } from "./_lib/listings";
import type { ApiListing, ListingView } from "./_lib/listings";

const districts = ["全部", "南山", "福田", "宝安", "龙华"];

export default function HomeMarketplace() {
  const [listings, setListings] = useState<ListingView[]>([]);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/session")
      .then((response) => response.json())
      .then((payload: { user: { displayName: string } | null }) => setUserName(payload.user?.displayName || null))
      .catch(() => null);
    fetch("/api/listings")
      .then(async (response) => {
        const payload = await response.json() as { listings?: ApiListing[] };
        if (response.ok) setListings((payload.listings || []).map(toListingView));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => listings.filter((item) => {
    const keyword = query.trim().toLowerCase();
    const matchesKeyword = !keyword || `${item.title}${item.district}${item.community}`.toLowerCase().includes(keyword);
    return matchesKeyword && (district === "全部" || item.district === district);
  }), [district, listings, query]);

  const selectDistrict = (value: string) => {
    setDistrict(value);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  };

  const feature = listings[0];

  return (
    <main className="zuji-page zuji-orange-theme">
      <SiteHeader active="find" userName={userName} />

      <section className="zuji-new-hero">
        <div className="zuji-container zuji-new-hero-grid">
          <div className="zuji-new-hero-copy">
            <div className="zuji-new-kicker"><span /> 深圳真实转租平台</div>
            <h1>租房这件事，<br /><em>可以更踏实一点。</em></h1>
            <p>从真实租客手里找到下一间房。价格、租期与租赁关系都清楚展示，少一点试探，多一点安心。</p>

            <div className="zuji-new-search">
              <span aria-hidden="true">⌕</span>
              <label>
                <small>想住在哪里？</small>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="小区、地铁站或区域" />
              </label>
              <button onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>开始找房 <b>→</b></button>
            </div>

            <div className="zuji-new-quick">
              <span>热门区域</span>
              {districts.slice(1).map((item) => <button key={item} onClick={() => selectDistrict(item)}>{item}</button>)}
            </div>

            <Link className="zuji-hero-publish-entry" href="/publish">
              <span className="zuji-hero-publish-icon">↗</span>
              <span><small>我是租客，有房要转租</small><b>进入房源发布工作台</b></span>
              <em>去发布 →</em>
            </Link>

            <div className="zuji-new-stats" aria-label="平台保障">
              <div><b>双重</b><span>身份与租约核验</span></div>
              <div><b>站内</b><span>沟通更安心</span></div>
              <div><b>免费</b><span>浏览全部房源</span></div>
            </div>
          </div>

          <div className="zuji-new-feature">
            <div className="zuji-feature-photo">
              <img src={feature?.image || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=82"} alt="明亮舒适的真实出租房源" />
              <span className="zuji-photo-count">精选房源 · 01</span>
              <div className="zuji-feature-info">
                <small>{feature?.district || "南山"} · {feature?.community || "后海"}</small>
                <b>¥{feature?.price.toLocaleString() || "3,600"}<em>/月</em></b>
              </div>
            </div>
            <div className="zuji-feature-note"><span>✓</span><p><b>本套租约已核验</b><small>地址与当前房源信息一致</small></p></div>
            <div className="zuji-feature-shape" aria-hidden="true">住得<br />明白</div>
          </div>
        </div>
      </section>

      <section className="zuji-new-catalog zuji-container" id="listings">
        <aside className="zuji-catalog-intro">
          <div className="zuji-new-kicker"><span /> 正在转租</div>
          <h2>看看最近<br />有哪些好房。</h2>
          <p>每套房源都来自真实租客。先从区域开始，慢慢找到适合你的那一间。</p>
          <div className="zuji-new-filters" role="group" aria-label="按区域筛选">
            {districts.map((item) => <button key={item} className={district === item ? "active" : ""} onClick={() => setDistrict(item)}>{item}<span>{item === "全部" ? listings.length : listings.filter((listing) => listing.district === item).length}</span></button>)}
          </div>
        </aside>

        <div className="zuji-catalog-results">
          <div className="zuji-results-head"><span>{loading ? "正在同步最新房源…" : `为你找到 ${filtered.length} 套房源`}</span><button type="button">最新发布 ↓</button></div>
          {filtered.length ? <div className="zuji-new-card-grid">{filtered.map((item, index) => <ListingCard key={item.id} listing={item} index={index} />)}</div> : <div className="zuji-new-empty"><b>暂时没有符合条件的房源</b><span>换个区域或搜索词试试。</span></div>}
        </div>
      </section>

      <section className="zuji-new-trust" id="trust">
        <div className="zuji-container zuji-new-trust-layout">
          <div className="zuji-trust-title"><div className="zuji-new-kicker light"><span /> 为什么更放心</div><h2>先看证据，<br />再决定要不要联系。</h2></div>
          <div className="zuji-new-trust-list">
            <article><b>01</b><div><h3>发布者身份可确认</h3><p>实名认证确认“这个人是谁”，让每一次沟通都有清晰的起点。</p></div></article>
            <article><b>02</b><div><h3>每套房单独核验租约</h3><p>合同地址与当前房源逐一匹配，避免旧合同被重复用于新房源。</p></div></article>
            <article><b>03</b><div><h3>沟通先留在站内</h3><p>问清租期与室友再决定，平台会持续提示你保护隐私和资金安全。</p></div></article>
          </div>
        </div>
      </section>

      <section className="zuji-new-publish zuji-container">
        <div><span>有房子需要转租？</span><h2>把真实信息讲清楚，<br />合适的租客自然会找到你。</h2></div>
        <Link href="/publish">发布我的房源 <span>→</span></Link>
      </section>

      <footer className="zuji-new-footer"><div className="zuji-container"><Link className="zuji-brand" href="/"><span>租</span><b>租迹 <em>ZUJI</em></b></Link><p>让转租回到租客之间。</p><small>© 2026 ZUJI</small></div></footer>
    </main>
  );
}

function ListingCard({ listing, index }: { listing: ListingView; index: number }) {
  return (
    <a className={`zuji-new-card ${index === 0 ? "featured" : ""}`} href={`/listings/${listing.id}`}>
      <div className="zuji-new-card-photo">
        <img src={listing.image} alt={listing.title} />
        <span>{listing.status === "pending_review" ? "⌛ 我的房源 · 审核中" : "✓ 租约已核验"}</span>
        <button type="button" aria-label="收藏房源" onClick={(event) => { event.preventDefault(); event.currentTarget.classList.toggle("saved"); }}>♡</button>
      </div>
      <div className="zuji-new-card-body">
        <div className="zuji-new-card-meta"><span>{listing.district} · {listing.community}</span><span>{listing.availableFrom}起</span></div>
        <h3>{listing.title}</h3>
        <div className="zuji-new-card-bottom"><p><b>¥{listing.price.toLocaleString()}</b><small>/月</small></p><span>查看详情 →</span></div>
      </div>
    </a>
  );
}
