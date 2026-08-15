"use client";

import { useEffect, useState } from "react";
import { useNavigationSession } from "../../_components/NavigationShell";
import Link from "../../_components/SafeLink";
import SiteHeader from "../../_components/SiteHeader";
import { getClientCache, setClientCache } from "../../_lib/client-cache";
import { toListingView } from "../../_lib/listings";
import type { ApiListing, ListingView } from "../../_lib/listings";

type Action = "message" | "viewing" | "login" | null;

const quickQuestions = [
  "房间现在还可以看吗？",
  "租期可以协商吗？",
  "室友和公共区域是什么情况？",
];

export default function ListingDetailClient({ id }: { id: string }) {
  const { user } = useNavigationSession();
  const userName = user === undefined ? undefined : user?.displayName || null;
  const authMethod = user?.authMethod || null;
  const [listing, setListing] = useState<ListingView | null>(() => {
    const cached = getClientCache<ApiListing>(`listing:${id}`);
    return cached ? toListingView(cached) : null;
  });
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(() => !getClientCache<ApiListing>(`listing:${id}`));
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action>(null);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const payload = await response.json() as { listing?: ApiListing; error?: string };
        if (!response.ok) throw new Error(payload.error || "房源加载失败");
        if (!payload.listing) throw new Error("房源不存在或已下架");
        setClientCache(`listing:${id}`, payload.listing);
        setListing(toListingView(payload.listing));
      })
      .catch((reason: unknown) => {
        if (!getClientCache<ApiListing>(`listing:${id}`)) {
          setError(reason instanceof Error ? reason.message : "房源加载失败");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!userName) {
      if (userName !== null) return;
      const clearTimer = window.setTimeout(() => setSaved(false), 0);
      return () => window.clearTimeout(clearTimer);
    }
    fetch("/api/favorites")
      .then((response) => response.json())
      .then((payload: { favoriteIds?: string[] }) => setSaved(Boolean(payload.favoriteIds?.includes(id))))
      .catch(() => setSaved(false));
  }, [id, userName]);

  const openAction = (next: Exclude<Action, "login" | null>) => {
    setResult("");
    setAction(next);
  };

  const handleUnauthorized = (status: number) => {
    if (status !== 401) return false;
    setAction("login");
    setResult("");
    return true;
  };

  const submitMessage = async () => {
    if (!listing || !message.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, body: message.trim() }),
      });
      if (handleUnauthorized(response.status)) return;
      const payload = await response.json() as { error?: string };
      setResult(response.ok ? "消息已发送。发布者回复后，你会收到站内通知。" : payload.error || "发送失败");
    } finally {
      setSubmitting(false);
    }
  };

  const submitViewing = async () => {
    if (!listing || !date || !time) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/viewing-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          requestedDate: date,
          requestedTime: time,
          note: note.trim(),
        }),
      });
      if (handleUnauthorized(response.status)) return;
      const payload = await response.json() as { error?: string };
      setResult(response.ok ? "看房申请已提交。发布者确认后，你会收到站内通知。" : payload.error || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const login = () => {
    window.location.href = `/login?return_to=${encodeURIComponent(`/listings/${id}`)}`;
  };

  const toggleSaved = async () => {
    if (userName === undefined || savingFavorite) return;
    if (!userName) return login();

    const previous = saved;
    setSaved(!previous);
    setSavingFavorite(true);
    try {
      const response = await fetch(previous ? `/api/favorites?listingId=${encodeURIComponent(id)}` : "/api/favorites", {
        method: previous ? "DELETE" : "POST",
        headers: previous ? undefined : { "content-type": "application/json" },
        body: previous ? undefined : JSON.stringify({ listingId: id }),
      });
      if (response.status === 401) return login();
      if (!response.ok) throw new Error("收藏操作失败");
    } catch {
      setSaved(previous);
    } finally {
      setSavingFavorite(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  if (loading) {
    return <main className="zuji-page zuji-black-yellow-theme"><div className="zuji-container zuji-detail-loading">正在加载房源…</div></main>;
  }

  if (!listing || error) {
    return (
      <main className="zuji-page zuji-black-yellow-theme">
        <div className="zuji-container zuji-detail-loading">
          <b>{error || "房源不存在"}</b>
          <Link href="/">返回房源列表</Link>
        </div>
      </main>
    );
  }

  const isPending = listing.status === "pending_review";
  const cityQuery = `?city=${encodeURIComponent(listing.city)}`;
  const districtQuery = `?city=${encodeURIComponent(listing.city)}&district=${encodeURIComponent(listing.district)}`;
  const showImage = (offset: number) => {
    setActiveImage((current) => (current + offset + listing.images.length) % listing.images.length);
  };

  return (
    <main className="zuji-page zuji-black-yellow-theme zuji-detail-page">
      <SiteHeader active="find" userName={userName} authMethod={authMethod} />

      <nav className="zuji-container zuji-breadcrumb" aria-label="房源位置">
        <Link href="/">找房</Link><span>›</span>
        <Link href={`/${cityQuery}`}>{listing.city}</Link><span>›</span>
        <Link href={`/${districtQuery}`}>{listing.district}</Link><span>›</span>
        <b>{listing.community}</b>
      </nav>

      <section className="zuji-detail-gallery zuji-container" aria-label="房源图片">
        <div className="zuji-detail-main-photo">
          <img src={listing.images[activeImage]} alt={`${listing.title}，第 ${activeImage + 1} 张图片`} />
          <span>实拍图片 · {activeImage + 1}/{listing.images.length}</span>
          {listing.images.length > 1 && (
            <div className="zuji-detail-photo-controls">
              <button onClick={() => showImage(-1)} aria-label="上一张图片">‹</button>
              <button onClick={() => showImage(1)} aria-label="下一张图片">›</button>
            </div>
          )}
        </div>
        <div className="zuji-detail-thumbs">
          {listing.images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              className={activeImage === index ? "active" : ""}
              onClick={() => setActiveImage(index)}
              aria-label={`查看第 ${index + 1} 张房源图片`}
              aria-pressed={activeImage === index}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      </section>

      <section className="zuji-detail-layout zuji-container">
        <article className="zuji-detail-content">
          <header className="zuji-detail-title">
            <div>
              <span>{listing.city} · {listing.district} · {listing.community}</span>
              <h1>{listing.title}</h1>
              <div className="zuji-detail-price-mobile">
                <strong>¥{listing.price.toLocaleString()}</strong><em>/月</em>
              </div>
              <div className="zuji-detail-tags" aria-label="房源状态">
                <b>{isPending ? "核验中" : "已核验"}</b>
                <span>{listing.availableFrom} 起可入住</span>
                <span>租约至 {listing.leaseEndsAt || "与发布者确认"}</span>
              </div>
            </div>
            <button
              className={saved ? "saved" : ""}
              disabled={savingFavorite}
              aria-label={saved ? "取消收藏" : "收藏房源"}
              aria-pressed={saved}
              onClick={toggleSaved}
            >{saved ? "♥" : "♡"}</button>
          </header>

          <section className="zuji-facts" aria-label="关键房源信息">
            <div><span>月租金</span><b>¥{listing.price.toLocaleString()}</b></div>
            <div><span>所在位置</span><b>{listing.district} · {listing.community}</b></div>
            <div><span>最早入住</span><b>{listing.availableFrom}</b></div>
            <div><span>租约到期</span><b>{listing.leaseEndsAt || "与发布者确认"}</b></div>
          </section>

          <section className="zuji-detail-section">
            <span className="zuji-detail-section-kicker">房源说明</span>
            <h2>关于这套房</h2>
            <p>{listing.description || "房源由真实租客发布。你可以在联系前确认室友、家具、通勤和租期等细节。"}</p>
          </section>

          <section className="zuji-detail-section">
            <span className="zuji-detail-section-kicker">平台核验</span>
            <h2>{isPending ? "资料正在核验" : "关键信息已完成核验"}</h2>
            <div className="zuji-evidence">
              <div><span>✓</span><p><b>发布账号已确认</b><small>实名信息不会对外展示。</small></p></div>
              <div><span>{isPending ? "…" : "✓"}</span><p><b>本套房合同{isPending ? "核验中" : "已匹配"}</b><small>用于核对地址、租期与发布信息。</small></p></div>
              <div><span>¥</span><p><b>租金证明已提交</b><small>仅显示核验结果，不公开原始材料。</small></p></div>
            </div>
          </section>

          <section className="zuji-safe-box">
            <b>交易安全提醒</b>
            <p>看房前不要支付押金、定金或转账。请勿点击陌生链接，优先在站内沟通。</p>
          </section>
        </article>

        <aside className="zuji-contact-card">
          <span>月租金</span>
          <strong>¥{listing.price.toLocaleString()} <em>/月</em></strong>
          <div className="zuji-contact-availability"><span>最早入住</span><b>{listing.availableFrom}</b></div>
          {isPending ? (
            <div className="zuji-pending-card"><b>房源正在审核</b><p>这是你的房源预览。审核通过后，其他租客即可预约和联系。</p></div>
          ) : (
            <>
              <p><i /> 发布者通常会在 24 小时内回复</p>
              <button className="primary" onClick={() => openAction("viewing")}>预约看房</button>
              <button className="secondary" onClick={() => openAction("message")}>先问问发布者</button>
              <small>发送后可继续在站内沟通，无需先交换微信</small>
            </>
          )}
        </aside>
      </section>

      <div className={`zuji-detail-mobile-actions${isPending ? " pending" : ""}`} aria-label="房源操作">
        {isPending ? (
          <><span>房源状态</span><b>资料审核中，暂不可预约</b></>
        ) : (
          <>
            <button className={saved ? "saved" : ""} disabled={savingFavorite} onClick={toggleSaved} aria-pressed={saved}>
              <i>{saved ? "♥" : "♡"}</i><span>{saved ? "已收藏" : "收藏"}</span>
            </button>
            <button className="message" onClick={() => openAction("message")}>咨询</button>
            <button className="viewing" onClick={() => openAction("viewing")}>预约看房</button>
          </>
        )}
      </div>

      {action && (
        <ActionDialog
          action={action}
          message={message}
          setMessage={setMessage}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          note={note}
          setNote={setNote}
          result={result}
          submitting={submitting}
          today={today}
          onClose={() => setAction(null)}
          onMessage={submitMessage}
          onViewing={submitViewing}
          onLogin={login}
        />
      )}
    </main>
  );
}

type DialogProps = {
  action: Exclude<Action, null>;
  message: string;
  setMessage: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  result: string;
  submitting: boolean;
  today: string;
  onClose: () => void;
  onMessage: () => void;
  onViewing: () => void;
  onLogin: () => void;
};

function ActionDialog(props: DialogProps) {
  const {
    action, message, setMessage, date, setDate, time, setTime, note, setNote,
    result, submitting, today, onClose, onMessage, onViewing, onLogin,
  } = props;

  return (
    <div className="zuji-dialog-backdrop" onClick={onClose}>
      <div className="zuji-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="zuji-dialog-close" onClick={onClose} aria-label="关闭">×</button>
        {action === "login" ? (
          <>
            <span>登录后继续</span>
            <h2>先登录，再联系发布者</h2>
            <p className="zuji-dialog-copy">浏览房源不需要登录。发送消息和预约看房需要登录，以便双方在站内安全沟通。</p>
            <button className="primary" onClick={onLogin}>登录并返回当前房源</button>
            <button className="zuji-dialog-link" onClick={onClose}>继续浏览</button>
          </>
        ) : (
          <>
            <span>{action === "message" ? "站内消息" : "预约看房"}</span>
            <h2>{action === "message" ? "先问清楚，再决定看房" : "选择你方便的时间"}</h2>
            {result ? (
              <><div className="zuji-dialog-result">✓ {result}</div><button className="zuji-dialog-link" onClick={onClose}>完成</button></>
            ) : action === "message" ? (
              <>
                <div className="zuji-quick-questions">
                  {quickQuestions.map((question) => <button key={question} onClick={() => setMessage(question)}>{question}</button>)}
                </div>
                <textarea value={message} maxLength={1000} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="输入你想了解的内容…" />
                <small className="zuji-message-count">{message.length}/1000</small>
                <div className="zuji-dialog-safe">请勿发送身份证号、银行卡或验证码，也不要提前转账。</div>
                <button className="primary" disabled={!message.trim() || submitting} onClick={onMessage}>{submitting ? "正在发送…" : "发送消息"}</button>
              </>
            ) : (
              <>
                <label>看房日期<input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} /></label>
                <label>大致时间<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
                <label>给发布者留言 <em>选填</em><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="例如：两个人看房，大约需要 20 分钟" /></label>
                <div className="zuji-dialog-safe">提交后等待发布者确认，不需要提前支付任何费用。</div>
                <button className="primary" disabled={!date || !time || submitting} onClick={onViewing}>{submitting ? "正在提交…" : "提交看房申请"}</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
