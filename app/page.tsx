"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

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
  { id: 1, title: "后海旁的安静次卧，采光很好", area: "南山 · 后海", location: "蔚蓝海岸", price: 3600, date: "9月1日起", tags: ["租赁已验证", "租金记录已验证"], image: "#d9e7dc", accent: "#7da58a" },
  { id: 2, title: "地铁 1 号线 · 阳光主卧转租", area: "福田 · 车公庙", location: "天安数码城", price: 4250, date: "8月20日起", tags: ["租赁已验证", "房东已确认"], image: "#eadcc8", accent: "#c28e55" },
  { id: 3, title: "西乡地铁站步行 8 分钟，带阳台", area: "宝安 · 西乡", location: "富通城", price: 3900, date: "9月15日起", tags: ["租赁已验证"], image: "#d9e1ed", accent: "#7791b6" },
  { id: 4, title: "红山地铁口一居室，短租友好", area: "龙华 · 红山", location: "龙光玖钻", price: 5800, date: "8月28日起", tags: ["租赁已验证", "租金记录已验证"], image: "#e7d9dd", accent: "#b5808c" },
];

export default function Home() {
  const [mode, setMode] = useState<"search" | "publish">("search");
  const [session, setSession] = useState<{ displayName: string; email: string } | null>(null);
  const [publishVerified, setPublishVerified] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [showPublish, setShowPublish] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  useEffect(() => {
    fetch("/api/session").then((response) => response.json()).then((payload: { user: { displayName: string; email: string } | null }) => setSession(payload.user)).catch(() => setSession(null));
  }, []);
  const openPublisher = () => {
    if (!session) return setAuthPrompt(true);
    setMode("publish");
    setShowPublish(true);
  };
  const loginThenPublish = () => {
    if (window.location.hostname !== "localhost") return window.location.href = "/signin-with-chatgpt?return_to=/";
    setSession({ displayName: "本地体验用户", email: "demo@zuji.local" });
    setAuthPrompt(false);
    setMode("publish");
    setShowPublish(true);
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

      {mode === "publish" ? <PublisherWorkspace verified={publishVerified} onBack={() => setMode("search")} onStartVerification={() => setShowPublish(true)} /> : <>
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

      <section className="explore shell" id="explore"><div className="section-heading"><div><p className="eyebrow">正在发生的真实转租</p><h2>看看附近有什么</h2></div><a href="#all">查看全部房源 <span>→</span></a></div><div className="filters">{["全部", "租赁已验证", "租金记录已验证", "房东已确认"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="listing-grid">{filtered.map((item) => <article className="listing" key={item.id} onClick={() => setSelectedListing(item)}><div className="listing-image" style={{ background: item.image }}><div className="image-shape" style={{ background: item.accent }} /><span className="verified-badge">✓ 已验证</span><button className={`save ${saved.includes(item.id) ? "saved" : ""}`} onClick={(event) => { event.stopPropagation(); setSaved((s) => s.includes(item.id) ? s.filter((x) => x !== item.id) : [...s, item.id]); }}>{saved.includes(item.id) ? "♥" : "♡"}</button></div><div className="listing-body"><div className="listing-meta"><span>{item.area}</span><span>·</span><span>{item.date}</span></div><h3>{item.title}</h3><p className="location">⌖ {item.location}</p><div className="listing-bottom"><strong>¥{item.price.toLocaleString()}<small> /月</small></strong><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag === "租金记录已验证" ? "¥ 记录已验" : tag === "房东已确认" ? "房东已确认" : "合同已匹配"}</span>)}</div></div></div></article>)}</div>{filtered.length === 0 && <div className="empty">没有找到符合条件的房源，换个关键词试试。</div>}</section>

      <section className="publish-banner shell"><div><p className="eyebrow">你也有房子要转租？</p><h2>把真实的租赁经历，<br /><i>交给下一个租客。</i></h2></div><button className="dark-button" onClick={openPublisher}>我想发布转租 <span>→</span></button></section>
      <footer className="footer shell" id="about"><div className="brand"><span className="brand-mark">租</span><span>租迹 <em>ZUJI</em></span></div><p>让转租回到租客之间。</p><span>© 2026 ZUJI</span></footer>
      </>}

      {selectedListing && <ListingDetail listing={selectedListing} session={session} onClose={() => setSelectedListing(null)} onLogin={() => { if (window.location.hostname === "localhost") setSession({ displayName: "本地体验用户", email: "demo@zuji.local" }); else window.location.href = "/signin-with-chatgpt?return_to=/"; }} />}

      {showPublish && <PublishFlow onClose={() => setShowPublish(false)} onComplete={() => { setShowPublish(false); setPublishVerified(true); }} />}
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
  const [submitted, setSubmitted] = useState(false);
  const [request, setRequest] = useState({ date: "", time: "", note: "" });
  const update = (key: keyof typeof request, value: string) => setRequest((current) => ({ ...current, [key]: value }));
  if (submitted) return <div className="modal-backdrop" onClick={onClose}><div className="detail-modal request-success" onClick={(event) => event.stopPropagation()}><div className="success-icon">✓</div><p className="eyebrow">申请已提交</p><h2>等发布者和你确认</h2><p>我们会把你的看房申请发送给发布者。双方确认后，租迹会在站内通知你。</p><button className="dark-button full" onClick={onClose}>返回房源列表 <span>→</span></button></div></div>;
    const needLogin = () => setLoginPrompt(true);
    const completeLogin = () => { onLogin(); setLoginPrompt(false); };
    return <div className="modal-backdrop" onClick={onClose}><div className="detail-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button>{loginPrompt ? <div className="login-required"><div className="login-required-icon">⌁</div><p className="eyebrow">登录后继续</p><h2>先登录，再联系租客</h2><p>匿名用户可以浏览全部房源。登录后才能发送消息或提交看房预约。</p><button className="dark-button full" onClick={completeLogin}>登录 / 注册 <span>→</span></button><button className="flow-skip" onClick={() => setLoginPrompt(false)}>返回房源详情</button></div> : !requestOpen && !contactOpen ? <><div className="detail-image" style={{ background: listing.image }}><div className="image-shape detail-shape" style={{ background: listing.accent }} /><span className="verified-badge">✓ 已验证房源</span></div><div className="detail-content"><div className="listing-meta"><span>{listing.area}</span><span>·</span><span>{listing.date}</span></div><h2>{listing.title}</h2><p className="location">⌖ {listing.location}</p><strong className="detail-price">¥{listing.price.toLocaleString()}<small> /月</small></strong><div className="evidence-grid"><div><span>✓</span><b>合同姓名匹配</b><small>与发布者 实名认证 实名一致</small></div><div><span>¥</span><b>租金记录已核验</b><small>连续 6 个月支付记录</small></div><div><span>⌂</span><b>{listing.tags.includes("房东已确认") ? "房东已确认" : "租期信息已核验"}</b><small>{listing.date} 可入住</small></div></div><p className="detail-tip">平台不会展示合同原件、身份证号或完整支付流水。你看到的是经过审核的结果。</p><div className="detail-actions"><button className="preview-button" onClick={session ? () => setRequestOpen(true) : needLogin}>预约看房</button><button className="dark-button" onClick={session ? () => setContactOpen(true) : needLogin}>联系发布者 <span>→</span></button></div></div></> : contactOpen ? <div className="request-form chat-form"><p className="eyebrow">站内消息</p><h2>联系发布者</h2><p className="modal-copy">关于“{listing.title}”，你可以先从一个安全问题开始。</p><div className="quick-questions">{["房间现在还可以看吗？", "租期可以协商吗？", "可以养宠物吗？"].map((question) => <button key={question} onClick={() => setMessage(question)}>{question}</button>)}</div>{messageSent ? <div className="sent-message">✓ 消息已发送，发布者回复后你会收到通知。</div> : <><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="输入你想了解的内容…" rows={5} /><div className="safe-chat-tip">⚠ 请在平台内沟通和确认，不要提前支付押金或点击陌生链接。</div><button className="dark-button full" disabled={!message.trim()} onClick={() => setMessageSent(true)}>发送消息 <span>→</span></button></>}<button className="flow-skip" onClick={() => { setContactOpen(false); setMessageSent(false); }}>返回房源详情</button></div> : <div className="request-form"><p className="eyebrow">预约看房</p><h2>选一个你方便的时间</h2><p className="modal-copy">提交后，发布者会在租迹内确认，不需要先交换私人联系方式。</p><label>看房日期<input type="date" value={request.date} onChange={(event) => update("date", event.target.value)} /></label><label>大致时间<input type="time" value={request.time} onChange={(event) => update("time", event.target.value)} /></label><label>给发布者留言 <span className="optional">可选</span><textarea value={request.note} onChange={(event) => update("note", event.target.value)} placeholder="例如：我会带一只猫，想先确认室友是否介意…" rows={3} /></label><button className="dark-button full" disabled={!request.date || !request.time} onClick={() => setSubmitted(true)}>提交看房申请 <span>→</span></button><button className="flow-skip" onClick={() => setRequestOpen(false)}>返回房源详情</button></div>}</div></div>;
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
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState("");
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
  const canSubmit = verified && Boolean(form.title.trim() && form.area.trim() && form.rent.trim() && form.date && form.expiry && form.expiry >= form.date);
  const submit = () => {
    if (!verified) return setFormError("请先完成 实名认证 和租赁合同认证。");
    if (!form.title.trim() || !form.area.trim() || !form.rent.trim()) return setFormError("请填写房源标题、区域和月租金。");
    if (!form.date || !form.expiry) return setFormError("请选择可入住时间和租约到期时间。");
    if (form.expiry < form.date) return setFormError("租约到期时间不能早于可入住时间。");
    setFormError("");
    setSubmitted(true);
  };
  if (submitted) return <section className="publisher-shell shell"><div className="success-card"><div className="success-icon">✓</div><p className="eyebrow">提交成功</p><h1>房源正在审核中</h1><p>我们会先核验你的身份与租赁材料。审核通过后，房源会自动进入找房列表。</p><div className="review-status"><span>01</span><b>身份与合同审核</b><small>预计 1 个工作日内完成</small></div><div className="review-status"><span>02</span><b>发布并开始曝光</b><small>租金记录验证可提升推荐排序</small></div><button className="dark-button full" onClick={onBack}>返回找房 <span>→</span></button></div></section>;
  return <section className="publisher-shell shell"><div className="publisher-head"><div><p className="eyebrow">我要转租 · 发布工作台</p><h1>把真实的租赁经历，<br /><i>交给下一个租客。</i></h1><p>先填写房源信息，提交后我们会根据你的认证材料进行审核。</p></div><button className="back-link" onClick={onBack}>← 返回找房</button></div><div className="publisher-layout"><div className="publish-form"><div className="form-title"><span>1</span><div><h2>房源基础信息</h2><p>这些信息会展示给正在找房的租客</p></div></div>{draftNotice && <div className="draft-notice">◌ {draftNotice}</div>}{!verified && <button className="verification-gate" onClick={onStartVerification}><span>!</span><div><b>完成身份和合同认证后才能发布</b><small>实名认证 与合同匹配不能跳过，点击开始认证</small></div>→</button>}<label>房源标题<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="例如：后海旁的安静次卧，采光很好" /></label><div className="form-row"><label>区域<input value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="例如：南山 · 后海" /></label><label>月租金<input value={form.rent} onChange={(e) => update("rent", e.target.value)} placeholder="¥ 3,600" /></label></div><div className="form-row"><label>可入住时间<input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></label><label>租约到期时间<input type="date" value={form.expiry} min={form.date || undefined} onChange={(e) => update("expiry", e.target.value)} /></label></div><label>转租说明 <span className="optional">可选</span><textarea value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="介绍房间、室友、周边和你希望的租客…" rows={4} /></label><div className="upload-placeholder"><span>＋</span><div><b>添加房源图片</b><small>最多 9 张，建议上传真实室内照片</small></div></div><div className="form-title second"><span>2</span><div><h2>发布前确认</h2><p>发布后仍可补充租金支付记录</p></div></div><label className="agree"><input type="checkbox" defaultChecked /> <span>我确认以上房源信息真实，并同意接受租迹审核</span></label>{formError && <div className="form-error">! {formError}</div>}<div className="form-actions"><button className="preview-button" onClick={() => setPreview(true)}>预览房源</button><button className="preview-button" onClick={clearDraft}>清空草稿</button><button className="dark-button" disabled={!canSubmit} onClick={submit}>提交审核 <span>→</span></button></div></div><div className="publisher-side"><div className="side-card"><span className="side-label">你的发布状态</span><div className="status-line"><span className={`status-dot ${verified ? "ready" : ""}`} />{verified ? "身份与合同已完成" : "身份认证待开始"}</div><div className={`status-line ${verified ? "" : "muted"}`}>{verified ? "合同匹配已完成" : "合同匹配待开始"}</div><div className="status-line muted">支付记录可选</div></div><div className="side-tip"><b>提高曝光的小提示</b><p>补充近 3–6 个月租金支付记录，审核通过后会获得“优先曝光”标签。</p></div></div></div>{preview && <div className="preview-overlay" onClick={() => setPreview(false)}><div className="preview-card" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setPreview(false)}>×</button><p className="eyebrow">租客看到的样子</p><h2>{form.title || "你的房源标题"}</h2><p className="listing-meta">{form.area || "城市 · 区域"} · {form.date || "可入住时间"} 至 {form.expiry || "租约到期时间"}</p><strong className="preview-price">{form.rent || "¥ 3,600"}<small> /月</small></strong><p>{form.note || "你的转租说明会显示在这里。"}</p><div className="preview-tags"><span>合同待审核</span><span>身份待审核</span></div></div></div>}</section>;
}


