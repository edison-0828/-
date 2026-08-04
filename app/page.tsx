"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import PublisherWorkspaceV2 from "./PublisherWorkspace";
import IdentityVerificationFlow from "./IdentityVerificationFlow";

type Listing = {
  id: string;
  publisherId: string;
  title: string;
  area: string;
  location: string;
  price: number;
  date: string;
  tags: string[];
  image: string;
  accent: string;
};

function LegacyHome() {
  const [mode, setMode] = useState<"search" | "publish">("search");
  const [session, setSession] = useState<{ displayName: string; email: string } | null>(null);
  const [publishVerified, setPublishVerified] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [showPublish, setShowPublish] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingError, setListingError] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/session").then((response) => response.json()).then((payload: { user: { displayName: string; email: string } | null }) => setSession(payload.user)).catch(() => setSession(null));
    fetch("/api/listings").then(async (response) => {
      const payload = await response.json() as { listings?: Array<{ id: string; publisherId: string; title: string; district: string; community: string; monthlyRentCents: number; availableFrom: string }>; error?: string };
      if (!response.ok) throw new Error(payload.error || "房源加载失败");
      setListings((payload.listings || []).map((item, index) => ({
        id: item.id, publisherId: item.publisherId, title: item.title, area: item.district, location: item.community,
        price: item.monthlyRentCents / 100, date: item.availableFrom, tags: ["租赁已验证"], image: [`url("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80")`, `url("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80")`, `url("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80")`, `url("https://images.unsplash.com/photo-1723810391398-79b45005e61c?auto=format&fit=crop&w=1200&q=80")`][index % 4], accent: ["#7da58a", "#c28e55", "#7791b6", "#b5808c"][index % 4],
      })));
    }).catch((error: unknown) => setListingError(error instanceof Error ? error.message : "房源加载失败"));
  }, []);
  const openPublisher = () => {
    if (!session) return setAuthPrompt(true);
    setMode("publish");
    setShowPublish(false);
  };
  const loginThenPublish = () => {
    if (window.location.hostname !== "localhost") return window.location.href = "/signin-with-chatgpt?return_to=/";
    setSession({ displayName: "本地体验用户", email: "demo@zuji.local" });
    setAuthPrompt(false);
    setMode("publish");
    setShowPublish(false);
  };
  const filtered = useMemo(() => listings.filter((item) => {
    const hit = `${item.title}${item.area}${item.location}`.includes(query);
    const verified = filter === "全部" || item.tags.includes(filter);
    return hit && verified;
  }).sort((a, b) => Number(b.tags.includes("租金记录已验证")) - Number(a.tags.includes("租金记录已验证"))), [query, filter]);

  return (
    <main>
      <nav className="nav shell">
        <div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div>
        <div className="nav-links"><a href="#explore">找房</a><a href="#trust">信任机制</a><a href="#about">关于租迹</a></div>
        <div className="nav-account"><div className="mode-switch" aria-label="选择使用模式"><button className={mode === "search" ? "active" : ""} onClick={() => { setMode("search"); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>我要找房</button><span>|</span><button className={mode === "publish" ? "active" : ""} onClick={openPublisher}>我要转租</button></div><button className="account-button" onClick={() => { if (!session) { if (window.location.hostname === "localhost") setSession({ displayName: "本地体验用户", email: "demo@zuji.local" }); else window.location.href = "/signin-with-chatgpt?return_to=/"; } }}>{session ? session.displayName : "登录"}</button></div>
      </nav>

      {mode === "publish" ? <PublisherWorkspaceV2 verified={publishVerified} onBack={() => setMode("search")} onStartVerification={() => setShowPublish(true)} /> : <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="dot" /> 深圳首发 · 真实租客的转租平台</p>
          <h1>少一点套路，<br /><i>多一点真实。</i></h1>
          <p className="hero-sub">每一条房源，都经过身份与租赁关系验证。<br />让转租回到租客之间，简单、透明、有依据。</p>
          <div className="search-box"><span className="search-icon">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索深圳小区或地铁站" /><button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>开始找房</button></div>
          <div className="hero-note"><span>✓</span> 实名认证 · 合同匹配 · 支付记录可查</div>
        </div>
        <div className="hero-art" aria-label="租迹信任卡片示意图">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="trust-card main-card"><div className="card-top"><span className="mini-logo">租</span><span>租迹认证</span><span className="check">✓</span></div><div className="card-line wide" /><div className="card-line" /><div className="card-footer"><span>租赁关系</span><strong>已验证</strong></div></div>
          <div className="float-card"><span className="float-icon">⌁</span><div><strong>租金记录</strong><small>连续 6 个月 · 已核验</small></div></div>
          <div className="stamp">真实<br />发生过</div>
        </div>
      </section>

      <section className="trust-strip" id="trust"><div className="shell trust-grid"><div><span className="trust-number">01</span><strong>先验证身份</strong><p>实名认证，确认你是谁</p></div><div><span className="trust-number">02</span><strong>再验证租赁</strong><p>合同信息与身份真实匹配</p></div><div><span className="trust-number">03</span><strong>持续可追溯</strong><p>支付记录、房东确认逐步加入</p></div><div className="trust-quote">“不靠一张嘴，<br /><b>用证据说话。</b>”</div></div></section>

      <section className="explore shell" id="explore"><div className="section-heading"><div><p className="eyebrow">正在发生的真实转租</p><h2>看看附近有什么</h2></div><a href="#all">查看全部房源 <span>→</span></a></div><div className="filters">{["全部", "租赁已验证", "租金记录已验证", "房东已确认"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>{listingError ? <div className="empty">{listingError}</div> : <div className="listing-grid">{filtered.map((item) => <article className="listing" key={item.id} onClick={() => setSelectedListing(item)}><div className="listing-image" style={{ background: item.image }}><div className="image-shape" style={{ background: item.accent }} /><span className="verified-badge">✓ 已验证</span><button className={`save ${saved.includes(item.id) ? "saved" : ""}`} onClick={(event) => { event.stopPropagation(); setSaved((s) => s.includes(item.id) ? s.filter((x) => x !== item.id) : [...s, item.id]); }}>{saved.includes(item.id) ? "♥" : "♡"}</button></div><div className="listing-body"><div className="listing-meta"><span>{item.area}</span><span>·</span><span>{item.date}</span></div><h3>{item.title}</h3><p className="location">⌖ {item.location}</p><div className="listing-bottom"><strong>¥{item.price.toLocaleString()}<small> /月</small></strong><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag === "租金记录已验证" ? "¥ 记录已验" : tag === "房东已确认" ? "房东已确认" : "合同已匹配"}</span>)}</div></div></div></article>)}</div>}{!listingError && filtered.length === 0 && <div className="empty">没有找到符合条件的房源，换个关键词试试。</div>}</section>

      <section className="publish-banner shell"><div><p className="eyebrow">你也有房子要转租？</p><h2>把真实的租赁经历，<br /><i>交给下一个租客。</i></h2></div><button className="dark-button" onClick={openPublisher}>我想发布转租 <span>→</span></button></section>
      <footer className="footer shell" id="about"><div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div><p>让转租回到租客之间。</p><span>© 2026 ZUJI</span></footer>
      </>}

      {selectedListing && <ListingDetail listing={selectedListing} session={session} onClose={() => setSelectedListing(null)} onLogin={() => { if (window.location.hostname === "localhost") setSession({ displayName: "本地体验用户", email: "demo@zuji.local" }); else window.location.href = "/signin-with-chatgpt?return_to=/"; }} />}

      {showPublish && <IdentityVerificationFlow onClose={() => setShowPublish(false)} onComplete={() => { setShowPublish(false); setPublishVerified(true); }} />}
      {authPrompt && <LoginRequired onClose={() => setAuthPrompt(false)} onLogin={loginThenPublish} />}
    </main>
  );
}

function LoginRequired({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal login-required" onClick={(event) => event.stopPropagation()}><div className="login-required-icon">⌁</div><p className="eyebrow">发布转租前</p><h2>请先登录</h2><p>登录后才能开始实名认证、上传租赁合同并发布转租信息。</p><button className="dark-button full" onClick={onLogin}>登录后继续 <span>→</span></button><button className="flow-skip" onClick={onClose}>暂不发布</button></div></div>;
}

function ListingDetail({ listing, session, onClose, onLogin }: { listing: Listing; session: { displayName: string; email: string } | null; onClose: () => void; onLogin: () => void }) {
    const [requestOpen, setRequestOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [loginPrompt, setLoginPrompt] = useState(false);
    const [message, setMessage] = useState("");
    const [messageSent, setMessageSent] = useState(false);
    const [actionError, setActionError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [request, setRequest] = useState({ date: "", time: "", note: "" });
  const update = (key: keyof typeof request, value: string) => setRequest((current) => ({ ...current, [key]: value }));
  const sendMessage = async () => {
    setActionError("");
    const response = await fetch("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ listingId: listing.id, body: message }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) return setActionError(payload.error || "消息发送失败");
    setMessageSent(true);
  };
  const submitRequest = async () => {
    setActionError("");
    const response = await fetch("/api/viewing-requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ listingId: listing.id, requestedDate: request.date, requestedTime: request.time, note: request.note }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) return setActionError(payload.error || "预约提交失败");
    setSubmitted(true);
  };
  if (submitted) return <div className="modal-backdrop" onClick={onClose}><div className="detail-modal request-success" onClick={(event) => event.stopPropagation()}><div className="success-icon">✓</div><p className="eyebrow">申请已提交</p><h2>等发布者和你确认</h2><p>我们会把你的看房申请发送给发布者。双方确认后，租迹会在站内通知你。</p><button className="dark-button full" onClick={onClose}>返回房源列表 <span>→</span></button></div></div>;
    const needLogin = () => setLoginPrompt(true);
    const completeLogin = () => { onLogin(); setLoginPrompt(false); };
    return <div className="modal-backdrop" onClick={onClose}><div className="detail-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button>{loginPrompt ? <div className="login-required"><div className="login-required-icon">⌁</div><p className="eyebrow">登录后继续</p><h2>先登录，再联系租客</h2><p>匿名用户可以浏览全部房源。登录后才能发送消息或提交看房预约。</p><button className="dark-button full" onClick={completeLogin}>登录 / 注册 <span>→</span></button><button className="flow-skip" onClick={() => setLoginPrompt(false)}>返回房源详情</button></div> : !requestOpen && !contactOpen ? <><div className="detail-image" style={{ background: listing.image }}><div className="image-shape detail-shape" style={{ background: listing.accent }} /><span className="verified-badge">✓ 已验证房源</span></div><div className="detail-content"><div className="listing-meta"><span>{listing.area}</span><span>·</span><span>{listing.date}</span></div><h2>{listing.title}</h2><p className="location">⌖ {listing.location}</p><strong className="detail-price">¥{listing.price.toLocaleString()}<small> /月</small></strong><div className="evidence-grid"><div><span>✓</span><b>合同姓名匹配</b><small>与发布者 实名认证 实名一致</small></div><div><span>¥</span><b>租金记录已核验</b><small>连续 6 个月支付记录</small></div><div><span>⌂</span><b>{listing.tags.includes("房东已确认") ? "房东已确认" : "租期信息已核验"}</b><small>{listing.date} 可入住</small></div></div><p className="detail-tip">平台不会展示合同原件、身份证号或完整支付流水。你看到的是经过审核的结果。</p><div className="detail-actions"><button className="preview-button" onClick={session ? () => setRequestOpen(true) : needLogin}>预约看房</button><button className="dark-button" onClick={session ? () => setContactOpen(true) : needLogin}>联系发布者 <span>→</span></button></div></div></> : contactOpen ? <div className="request-form chat-form"><p className="eyebrow">站内消息</p><h2>联系发布者</h2><p className="modal-copy">关于“{listing.title}”，你可以先从一个安全问题开始。</p><div className="quick-questions">{["房间现在还可以看吗？", "租期可以协商吗？", "可以养宠物吗？"].map((question) => <button key={question} onClick={() => setMessage(question)}>{question}</button>)}</div>{messageSent ? <div className="sent-message">✓ 消息已发送，发布者回复后你会收到通知。</div> : <><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="输入你想了解的内容…" rows={5} /><div className="safe-chat-tip">⚠ 请在平台内沟通和确认，不要提前支付押金或点击陌生链接。</div>{actionError && <div className="form-error">! {actionError}</div>}<button className="dark-button full" disabled={!message.trim()} onClick={sendMessage}>发送消息 <span>→</span></button></>}<button className="flow-skip" onClick={() => { setContactOpen(false); setMessageSent(false); setActionError(""); }}>返回房源详情</button></div> : <div className="request-form"><p className="eyebrow">预约看房</p><h2>选一个你方便的时间</h2><p className="modal-copy">提交后，发布者会在租迹内确认，不需要先交换私人联系方式。</p><label>看房日期<input type="date" value={request.date} onChange={(event) => update("date", event.target.value)} /></label><label>大致时间<input type="time" value={request.time} onChange={(event) => update("time", event.target.value)} /></label><label>给发布者留言 <span className="optional">可选</span><textarea value={request.note} onChange={(event) => update("note", event.target.value)} placeholder="例如：我会带一只猫，想先确认室友是否介意…" rows={3} /></label>{actionError && <div className="form-error">! {actionError}</div>}<button className="dark-button full" disabled={!request.date || !request.time} onClick={submitRequest}>提交看房申请 <span>→</span></button><button className="flow-skip" onClick={() => setRequestOpen(false)}>返回房源详情</button></div>}</div></div>;
}

const landingCopy = {
  find: "\u627e\u5230\u4e00\u95f4\u771f\u5b9e\u7684\u8f6c\u79df\u623f",
  sub: "\u79df\u8ff9\u53ea\u6536\u5f55\u6709\u5b9e\u9645\u79df\u8d41\u5173\u7cfb\u7684\u623f\u6e90\uff0c\u8ba9\u4f60\u5c11\u8d70\u5f2f\u8def\uff0c\u5c11\u8e29\u5751\u3002",
  placeholder: "\u641c\u7d22\u5c0f\u533a\u3001\u5730\u94c1\u7ad9\u6216\u533a\u57df",
  search: "\u5f00\u59cb\u627e\u623f",
  verified: "\u6bcf\u6761\u623f\u6e90\u90fd\u6709\u8bc1\u636e",
  browse: "\u9644\u8fd1\u7684\u771f\u5b9e\u623f\u6e90",
  publish: "\u6211\u6709\u623f\u8981\u8f6c\u79df",
};

export default function Home() {
  const [session, setSession] = useState<{ displayName: string; email: string } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mode, setMode] = useState<"search" | "publish">("search");
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  useEffect(() => {
    fetch("/api/session").then((response) => response.json()).then((payload: { user: { displayName: string; email: string } | null }) => setSession(payload.user)).catch(() => setSession(null));
  fetch("/api/listings").then((response) => response.json()).then((payload: { listings?: Array<{ id: string; publisherId: string; title: string; district: string; community: string; monthlyRentCents: number; availableFrom: string }> }) => setListings((payload.listings || []).map((item, index) => ({ id: item.id, publisherId: item.publisherId, title: item.title, area: item.district, location: item.community, price: item.monthlyRentCents / 100, date: item.availableFrom, tags: ["租赁已验证"], image: [`url("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80")`, `url("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80")`, `url("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80")`, `url("https://images.unsplash.com/photo-1723810391398-79b45005e61c?auto=format&fit=crop&w=1200&q=80")`][index % 4], accent: ["#7da58a", "#c28e55", "#7791b6", "#b5808c"][index % 4] })))).catch(() => setListings([]));
  }, []);
  const goPublish = () => { setMode("publish"); window.location.hash = "publish"; };
  useEffect(() => {
    const actions = document.querySelector(".landing-nav-actions");
    if (!actions || actions.querySelector(".role-switch")) return;
    const switcher = document.createElement("div");
    switcher.className = "role-switch";
    const searchButton = document.createElement("button");
    searchButton.textContent = "\u6211\u8981\u627e\u623f";
    searchButton.className = "active";
    searchButton.onclick = () => { setMode("search"); window.location.hash = ""; searchButton.classList.add("active"); publishButton.classList.remove("active"); };
    const publishButton = document.createElement("button");
    publishButton.textContent = "\u6211\u8981\u8f6c\u79df";
    publishButton.onclick = () => { goPublish(); publishButton.classList.add("active"); searchButton.classList.remove("active"); };
    switcher.append(searchButton, publishButton);
    actions.prepend(switcher);
    return () => switcher.remove();
  }, []);
  const filtered = listings.filter((item) => `${item.title}${item.area}${item.location}`.includes(query));
  const login = () => { if (window.location.hostname === "localhost") setSession({ displayName: "本地体验用户", email: "demo@zuji.local" }); else window.location.href = "/signin-with-chatgpt?return_to=/"; };
  if (mode === "publish") return <><PublisherWorkspaceV2 verified={identityVerified} onBack={() => setMode("search")} onStartVerification={() => setShowIdentity(true)} />{showIdentity && <IdentityVerificationFlow onClose={() => setShowIdentity(false)} onComplete={() => { setShowIdentity(false); setIdentityVerified(true); }} />}</>;
  return <main className="landing-v2"><nav className="landing-nav shell"><div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div><div className="landing-nav-links"><a href="#how">{"\u600e\u4e48\u9a8c\u8bc1"}</a><a href="#listings">{"\u770b\u770b\u623f\u6e90"}</a></div><div className="landing-nav-actions"><button className="publish-link" onClick={goPublish}>{landingCopy.publish} <span>→</span></button><button className="account-button" onClick={login}>{session ? session.displayName : "\u767b\u5f55"}</button></div></nav><section className="landing-hero shell"><div className="landing-hero-copy"><p className="eyebrow"><span className="dot" />{"\u6df1\u5733\u9996\u53d1 \u00b7 \u4e3a\u771f\u5b9e\u79df\u5ba2\u800c\u6765"}</p><h1>{landingCopy.find}</h1><p className="landing-sub">{landingCopy.sub}</p><div className="landing-search"><span className="search-icon">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={landingCopy.placeholder} /><button onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>{landingCopy.search}<span>→</span></button></div><div className="landing-trust"><span>✓ {landingCopy.verified}</span><span>✓ {"\u5b9e\u540d\u8ba4\u8bc1"}</span><span>✓ {"\u79df\u8d41\u5408\u540c\u5339\u914d"}</span></div></div><div className="landing-hero-card"><div className="hero-card-label">{"\u79df\u8ff9\u8ba4\u8bc1"}<span>✓</span></div><div className="hero-card-title">{"\u8fd9\u95f4\u623f\uff0c\u6709\u4eba\u771f\u5b9e\u4f4f\u8fc7"}</div><div className="hero-card-lines"><i /><i /><i /></div><div className="hero-card-bottom"><span>{"\u5408\u540c\u5173\u7cfb"}</span><b>{"\u5df2\u9a8c\u8bc1"}</b></div><div className="hero-card-note">{"\u4e0d\u9760\u4e00\u5f20\u5634\uff0c\u7528\u8bc1\u636e\u8bf4\u8bdd\u3002"}</div></div></section><section className="landing-proof" id="how"><div className="shell landing-proof-inner"><div><b>01</b><span>{"\u5148\u770b\u8eab\u4efd"}</span><small>{"\u77e5\u9053\u53d1\u5e03\u8005\u662f\u8c01"}</small></div><div><b>02</b><span>{"\u518d\u770b\u5408\u540c"}</span><small>{"\u786e\u8ba4\u79df\u8d41\u5173\u7cfb\u5339\u914d"}</small></div><div><b>03</b><span>{"\u6700\u540e\u518d\u8054\u7cfb"}</span><small>{"\u7ad9\u5185\u6c9f\u901a\uff0c\u4e0d\u6025\u7740\u4ea4\u94b1"}</small></div></div></section><section className="landing-listings shell" id="listings"><div className="landing-section-head"><div><p className="eyebrow">{landingCopy.browse}</p><h2>{"\u5148\u770b\u770b\uff0c\u518d\u51b3\u5b9a"}</h2></div><span>{filtered.length ? `${filtered.length} \u5957` : "\u6682\u65e0\u5339\u914d"}</span></div>{filtered.length ? <div className="landing-listing-grid">{filtered.slice(0, 4).map((item) => <article className="landing-listing" key={item.id} onClick={() => setSelectedListing(item)}><div className="landing-listing-image" style={{ background: item.image }}><div className="image-shape" style={{ background: item.accent }} /><span>✓ {"\u5df2\u9a8c\u8bc1"}</span></div><div className="landing-listing-body"><small>{item.area} · {item.date}</small><h3>{item.title}</h3><p>⌖ {item.location}</p><strong>¥{item.price.toLocaleString()}<em> /月</em></strong></div></article>)}</div> : <div className="landing-empty">{"\u623f\u6e90\u6b63\u5728\u9646\u7eed\u4e0a\u65b0\uff0c\u8bf7\u5148\u641c\u7d22\u5c0f\u533a\u6216\u5730\u94c1\u7ad9\u3002"}</div>}</section>{selectedListing && <ListingDetail listing={selectedListing} session={session} onClose={() => setSelectedListing(null)} onLogin={login} />}<footer className="landing-footer shell"><div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div><p>{"\u8ba9\u8f6c\u79df\u56de\u5230\u79df\u5ba2\u4e4b\u95f4\u3002"}</p></footer></main>;
}

function PublishFlow({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [addPaymentRecord, setAddPaymentRecord] = useState(true);
  const [idFile, setIdFile] = useState("");
  const [faceFile, setFaceFile] = useState("");
  const [contractFile, setContractFile] = useState("");
  const [paymentFiles, setPaymentFiles] = useState<string[]>([]);
  const steps = [{ title: "先确认身份", desc: "实名认证是发布真实房源的基础。", action: "开始身份认证", icon: "◎" }, { title: "匹配租赁合同", desc: "上传合同后，我们只提取姓名、地址和租期等必要信息。", action: "上传租赁合同", icon: "▤" }, { title: "补充租金记录", desc: "可选上传近 3–6 个月的支付记录，提升房源可信度。", action: "添加支付记录", icon: "¥" }];
  const current = steps[step];
  const requiredReady = step === 0 ? Boolean(idFile && faceFile) : step === 1 ? Boolean(contractFile) : !addPaymentRecord || paymentFiles.length > 0;
  const chooseFile = (setter: (name: string) => void) => (event: ChangeEvent<HTMLInputElement>) => setter(event.target.files?.[0]?.name || "");
  const choosePaymentFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []).map((file) => file.name);
    setPaymentFiles((current) => Array.from(new Set([...current, ...incoming])).slice(0, 6));
    event.currentTarget.value = "";
  };
  const removePaymentFile = (name: string) => setPaymentFiles((current) => current.filter((file) => file !== name));
  return <div className="modal-backdrop" onClick={onClose}><div className="modal publish-flow" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><p className="eyebrow">发布认证 · {step + 1} / 3</p><div className="flow-progress">{steps.map((_, index) => <span className={index <= step ? "done" : ""} key={index} />)}</div><div className="flow-icon">{current.icon}</div><h2>{current.title}</h2><p className="modal-copy">{current.desc}</p>{step < 2 && <div className="required-notice"><b>发布必需完成</b><span>{step === 0 ? "实名认证 实名认证不能跳过" : "租赁合同匹配不能跳过"}</span></div>}{step === 0 && <div className="verification-upload"><label className={`upload-tile ${idFile ? "ready" : ""}`}><input type="file" accept="image/*" onChange={chooseFile(setIdFile)} /><span>{idFile ? "✓" : "＋"}</span><b>{idFile ? "证件已选择" : "上传证件照片"}</b><small>{idFile || "支持 JPG、PNG"}</small></label><label className={`upload-tile ${faceFile ? "ready" : ""}`}><input type="file" accept="image/*" capture="user" onChange={chooseFile(setFaceFile)} /><span>{faceFile ? "✓" : "＋"}</span><b>{faceFile ? "人脸材料已选择" : "完成活体验证"}</b><small>{faceFile || "拍摄本人实时照片"}</small></label></div>}{step === 1 && <label className={`contract-upload ${contractFile ? "ready" : ""}`}><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={chooseFile(setContractFile)} /><span>{contractFile ? "✓" : "＋"}</span><div><b>{contractFile ? "租赁合同已选择" : "上传租赁合同"}</b><small>{contractFile || "支持 PDF、JPG、PNG，姓名将与 实名认证 自动匹配"}</small></div></label>}{step === 2 && <><label className={`contract-upload payment-upload ${paymentFiles.length ? "ready" : ""}`}><input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={choosePaymentFiles} /><span>{paymentFiles.length ? "✓" : "＋"}</span><div><b>{paymentFiles.length ? `已选择 ${paymentFiles.length} 张记录` : "上传租金支付记录"}</b><small>{paymentFiles.length ? "再次选择会追加，最多 6 个文件" : "最多 6 张，支持 PDF、JPG、PNG"}</small></div></label>{paymentFiles.length > 0 && <div className="file-chips">{paymentFiles.map((file) => <span key={file}>{file}<button type="button" onClick={() => removePaymentFile(file)} aria-label={`移除 ${file}`}>×</button></span>)}</div>}<button className={`exposure-option ${addPaymentRecord ? "selected" : ""}`} onClick={() => setAddPaymentRecord((value) => !value)}><span className="option-check">{addPaymentRecord ? "✓" : ""}</span><span><b>添加后获得优先曝光</b><small>支付记录通过审核后，房源会在推荐排序中优先展示。</small></span></button></>}{step < 2 && <div className="flow-check"><span>✓</span><div><b>隐私保护已开启</b><small>审核材料不会公开展示，验证结果才会显示在房源上</small></div></div>}{step === 2 && <div className="flow-check"><span>✓</span><div><b>支付记录为可选材料</b><small>你可以上传最多 6 张，或直接跳过此步骤</small></div></div>}<button className="dark-button full" disabled={!requiredReady} onClick={() => step < 2 ? setStep(step + 1) : onComplete()}>{step === 2 && !addPaymentRecord ? "完成发布准备" : current.action} <span>→</span></button>{step === 2 && <button className="flow-skip" onClick={onComplete}>跳过，稍后再说</button>}</div></div>;
}

function PublisherWorkspace({ verified, onBack, onStartVerification }: { verified: boolean; onBack: () => void; onStartVerification: () => void }) {
  type ImageFile = { name: string; url: string };
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [draftNotice, setDraftNotice] = useState("");
  const [form, setForm] = useState({ title: "", area: "", rent: "", date: "", expiry: "", note: "" });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    const savedDraft = window.localStorage.getItem("zuji-publish-draft");
    if (savedDraft) {
      try {
        setForm((current) => ({ ...current, ...JSON.parse(savedDraft) }));
        setDraftNotice("已恢复上次未完成的草稿");
      } catch {
        window.localStorage.removeItem("zuji-publish-draft");
      }
    }
  }, []);
  useEffect(() => {
    if (Object.values(form).some(Boolean)) {
      window.localStorage.setItem("zuji-publish-draft", JSON.stringify(form));
      setDraftNotice("草稿已自动保存");
    }
  }, [form]);
  const clearDraft = () => {
    window.localStorage.removeItem("zuji-publish-draft");
    setForm({ title: "", area: "", rent: "", date: "", expiry: "", note: "" });
    setDraftNotice("草稿已清空");
  };
  const chooseImages = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    const available = Math.max(0, 8 - imageFiles.length);
    const selected = incoming.slice(0, available).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setImageFiles((current) => [...current, ...selected]);
    if (incoming.length > available) setFormError("房源图片最多上传 8 张。已保留前 8 张。");
    event.currentTarget.value = "";
  };
  const removeImage = (url: string) => {
    URL.revokeObjectURL(url);
    setImageFiles((current) => current.filter((image) => image.url !== url));
  };
  const canSubmit = verified && Boolean(form.title.trim() && form.area.trim() && form.rent.trim() && form.date && form.expiry && form.expiry >= form.date);
  const submit = async () => {
    if (!verified) return setFormError("请先完成 实名认证 和租赁合同认证。");
    if (!form.title.trim() || !form.area.trim() || !form.rent.trim()) return setFormError("请填写房源标题、区域和月租金。");
    if (!form.date || !form.expiry) return setFormError("请选择可入住时间和租约到期时间。");
    if (form.expiry < form.date) return setFormError("租约到期时间不能早于可入住时间。");
    setFormError("");
    setSubmitting(true);
    try {
      const area = form.area.trim();
      const [district = area, community = district] = area.split("·").map((part) => part.trim());
      const response = await fetch("/api/listings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: form.title.trim(), district, community, monthlyRentCents: Math.round(Number(form.rent.replace(/[^0-9.]/g, "")) * 100), availableFrom: form.date, leaseEndsAt: form.expiry, description: form.note.trim() }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) return setFormError(payload.error || "提交审核失败");
      window.localStorage.removeItem("zuji-publish-draft");
      setSubmitted(true);
    } catch {
      setFormError("网络异常，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) return <section className="publisher-shell shell"><div className="success-card"><div className="success-icon">✓</div><p className="eyebrow">提交成功</p><h1>房源正在审核中</h1><p>我们会先核验你的身份与租赁材料。审核通过后，房源会自动进入找房列表。</p><div className="review-status"><span>01</span><b>身份与合同审核</b><small>预计 1 个工作日内完成</small></div><div className="review-status"><span>02</span><b>发布并开始曝光</b><small>租金记录验证可提升推荐排序</small></div><button className="dark-button full" onClick={onBack}>返回找房 <span>→</span></button></div></section>;
  return <section className="publisher-shell shell"><div className="publisher-head"><div><p className="eyebrow">我要转租 · 发布工作台</p><h1>把真实的租赁经历，<br /><i>交给下一个租客。</i></h1><p>先填写房源信息，提交后我们会根据你的认证材料进行审核。</p></div><button className="back-link" onClick={onBack}>← 返回找房</button></div><div className="publisher-layout"><div className="publish-form"><div className="form-title"><span>1</span><div><h2>房源基础信息</h2><p>这些信息会展示给正在找房的租客</p></div></div>{draftNotice && <div className="draft-notice">◌ {draftNotice}</div>}{!verified && <button className="verification-gate" onClick={onStartVerification}><span>!</span><div><b>完成身份和合同认证后才能发布</b><small>实名认证 与合同匹配不能跳过，点击开始认证</small></div>→</button>}<label>房源标题<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="例如：后海旁的安静次卧，采光很好" /></label><div className="form-row"><label>区域<input value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="例如：南山 · 后海" /></label><label>月租金<input value={form.rent} onChange={(e) => update("rent", e.target.value)} placeholder="¥ 3,600" /></label></div><div className="form-row"><label>可入住时间<input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></label><label>租约到期时间<input type="date" value={form.expiry} min={form.date || undefined} onChange={(e) => update("expiry", e.target.value)} /></label></div><label>转租说明 <span className="optional">可选</span><textarea value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="介绍房间、室友、周边和你希望的租客…" rows={4} /></label><div className="upload-placeholder"><span>＋</span><div><b>添加房源图片</b><small>最多 9 张，建议上传真实室内照片</small></div></div><div className="form-title second"><span>2</span><div><h2>发布前确认</h2><p>发布后仍可补充租金支付记录</p></div></div><label className="agree"><input type="checkbox" defaultChecked /> <span>我确认以上房源信息真实，并同意接受租迹审核</span></label>{formError && <div className="form-error">! {formError}</div>}<div className="form-actions"><button className="preview-button" onClick={() => setPreview(true)}>预览房源</button><button className="preview-button" onClick={clearDraft}>清空草稿</button><button className="dark-button" disabled={!canSubmit} onClick={submit}>提交审核 <span>→</span></button></div></div><div className="publisher-side"><div className="side-card"><span className="side-label">你的发布状态</span><div className="status-line"><span className={`status-dot ${verified ? "ready" : ""}`} />{verified ? "身份与合同已完成" : "身份认证待开始"}</div><div className={`status-line ${verified ? "" : "muted"}`}>{verified ? "合同匹配已完成" : "合同匹配待开始"}</div><div className="status-line muted">支付记录可选</div></div><div className="side-tip"><b>提高曝光的小提示</b><p>补充近 3–6 个月租金支付记录，审核通过后会获得“优先曝光”标签。</p></div></div></div>{preview && <div className="preview-overlay" onClick={() => setPreview(false)}><div className="preview-card" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setPreview(false)}>×</button><p className="eyebrow">租客看到的样子</p><h2>{form.title || "你的房源标题"}</h2><p className="listing-meta">{form.area || "城市 · 区域"} · {form.date || "可入住时间"} 至 {form.expiry || "租约到期时间"}</p><strong className="preview-price">{form.rent || "¥ 3,600"}<small> /月</small></strong><p>{form.note || "你的转租说明会显示在这里。"}</p><div className="preview-tags"><span>合同待审核</span><span>身份待审核</span></div></div></div>}</section>;
}


