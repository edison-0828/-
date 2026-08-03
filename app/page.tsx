"use client";

import { useMemo, useState } from "react";

type Listing = {
  id: number;
  title: string;
  area: string;
  location: string;
  price: number;
  date: string;
  tags: string[];
  image: string;
  accent: string;
};

const listings: Listing[] = [
  { id: 1, title: "朝阳公园旁的安静次卧", area: "朝阳 · 望京", location: "融科橄榄城", price: 3600, date: "9月1日起", tags: ["租赁已验证", "租金记录已验证"], image: "#d9e7dc", accent: "#7da58a" },
  { id: 2, title: "地铁 4 号线 · 阳光主卧转租", area: "海淀 · 中关村", location: "科源小区", price: 4250, date: "8月20日起", tags: ["租赁已验证", "房东已确认"], image: "#eadcc8", accent: "#c28e55" },
  { id: 3, title: "五道口步行 8 分钟，带阳台", area: "海淀 · 五道口", location: "华清嘉园", price: 3900, date: "9月15日起", tags: ["租赁已验证"], image: "#d9e1ed", accent: "#7791b6" },
  { id: 4, title: "新装修一居室，短租友好", area: "东城 · 东直门", location: "东环广场", price: 5800, date: "8月28日起", tags: ["租赁已验证", "租金记录已验证"], image: "#e7d9dd", accent: "#b5808c" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [showPublish, setShowPublish] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const filtered = useMemo(() => listings.filter((item) => {
    const hit = `${item.title}${item.area}${item.location}`.includes(query);
    const verified = filter === "全部" || item.tags.includes(filter);
    return hit && verified;
  }), [query, filter]);

  return (
    <main>
      <nav className="nav shell">
        <div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div>
        <div className="nav-links"><a href="#explore">找房</a><a href="#trust">信任机制</a><a href="#about">关于租迹</a></div>
        <button className="ghost-button" onClick={() => setShowPublish(true)}>发布转租 <span>＋</span></button>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="dot" /> 真实租客的转租平台</p>
          <h1>少一点套路，<br /><i>多一点真实。</i></h1>
          <p className="hero-sub">每一条房源，都经过身份与租赁关系验证。<br />让转租回到租客之间，简单、透明、有依据。</p>
          <div className="search-box"><span className="search-icon">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索城市、小区或地铁站" /><button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>开始找房</button></div>
          <div className="hero-note"><span>✓</span> 实名认证 · 合同匹配 · 支付记录可查</div>
        </div>
        <div className="hero-art" aria-label="租迹信任卡片示意图">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="trust-card main-card"><div className="card-top"><span className="mini-logo">租</span><span>租迹认证</span><span className="check">✓</span></div><div className="card-line wide" /><div className="card-line" /><div className="card-footer"><span>租赁关系</span><strong>已验证</strong></div></div>
          <div className="float-card"><span className="float-icon">⌁</span><div><strong>租金记录</strong><small>连续 6 个月 · 已核验</small></div></div>
          <div className="stamp">真实<br />发生过</div>
        </div>
      </section>

      <section className="trust-strip" id="trust"><div className="shell trust-grid"><div><span className="trust-number">01</span><strong>先验证身份</strong><p>KYC 实名认证，确认你是谁</p></div><div><span className="trust-number">02</span><strong>再验证租赁</strong><p>合同信息与身份真实匹配</p></div><div><span className="trust-number">03</span><strong>持续可追溯</strong><p>支付记录、房东确认逐步加入</p></div><div className="trust-quote">“不靠一张嘴，<br /><b>用证据说话。</b>”</div></div></section>

      <section className="explore shell" id="explore"><div className="section-heading"><div><p className="eyebrow">正在发生的真实转租</p><h2>看看附近有什么</h2></div><a href="#all">查看全部房源 <span>→</span></a></div><div className="filters">{["全部", "租赁已验证", "租金记录已验证", "房东已确认"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="listing-grid">{filtered.map((item) => <article className="listing" key={item.id}><div className="listing-image" style={{ background: item.image }}><div className="image-shape" style={{ background: item.accent }} /><span className="verified-badge">✓ 已验证</span><button className={`save ${saved.includes(item.id) ? "saved" : ""}`} onClick={() => setSaved((s) => s.includes(item.id) ? s.filter((x) => x !== item.id) : [...s, item.id])}>{saved.includes(item.id) ? "♥" : "♡"}</button></div><div className="listing-body"><div className="listing-meta"><span>{item.area}</span><span>·</span><span>{item.date}</span></div><h3>{item.title}</h3><p className="location">⌖ {item.location}</p><div className="listing-bottom"><strong>¥{item.price.toLocaleString()}<small> /月</small></strong><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag === "租金记录已验证" ? "¥ 记录已验" : tag === "房东已确认" ? "房东已确认" : "合同已匹配"}</span>)}</div></div></div></article>)}</div>{filtered.length === 0 && <div className="empty">没有找到符合条件的房源，换个关键词试试。</div>}</section>

      <section className="publish-banner shell"><div><p className="eyebrow">你也有房子要转租？</p><h2>把真实的租赁经历，<br /><i>交给下一个租客。</i></h2></div><button className="dark-button" onClick={() => setShowPublish(true)}>我想发布转租 <span>→</span></button></section>
      <footer className="footer shell" id="about"><div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div><p>让转租回到租客之间。</p><span>© 2026 ZUJI</span></footer>

      {showPublish && <div className="modal-backdrop" onClick={() => setShowPublish(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowPublish(false)}>×</button><p className="eyebrow">发布前的第一步</p><h2>先让我们认识真实的你</h2><p className="modal-copy">为了保护每一位租客，发布转租需要完成身份认证，并上传能证明租赁关系的材料。</p><div className="verify-steps"><div><span>1</span><b>KYC 实名认证</b><small>证件 + 人脸识别</small></div><div><span>2</span><b>上传租赁合同</b><small>姓名与合同自动匹配</small></div><div><span>3</span><b>补充支付记录</b><small>可选，提升信任等级</small></div></div><button className="dark-button full" onClick={() => setShowPublish(false)}>开始认证 <span>→</span></button><small className="privacy">你的原始材料仅用于审核，不会公开展示</small></div></div>}
    </main>
  );
}
