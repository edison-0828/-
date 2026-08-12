"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../../_components/SiteHeader";
import Link from "../../_components/SafeLink";

type MessageItem = { id: string; body: string; createdAt: string; readAt: string | null; mine: boolean };
type ThreadData = {
  listing: { id: string; title: string; district: string; community: string; monthlyRentCents: number; publisherId: string; status: string };
  participant: { id: string; label: string };
  messages: MessageItem[];
};

export default function MessageThreadClient({ listingId, participantId, userName, authMethod }: { listingId: string; participantId: string; userName: string; authMethod: "chatgpt" | "demo" }) {
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const loadThread = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const query = new URLSearchParams({ listingId });
      if (participantId) query.set("participantId", participantId);
      const response = await fetch(`/api/messages?${query}`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      const payload = await response.json() as ThreadData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "消息加载失败");
      setThread(payload);
      setError("");

      if (payload.messages.some((message) => !message.mine && !message.readAt)) {
        await fetch("/api/messages", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ listingId, participantId: payload.participant.id }),
        });
        window.dispatchEvent(new Event("zuji:notifications-changed"));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "消息加载失败");
    } finally {
      setLoading(false);
    }
  }, [listingId, participantId]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void loadThread(true), 0);
    const timer = window.setInterval(() => void loadThread(), 10000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [loadThread]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [thread?.messages.length]);

  const sendMessage = async () => {
    const messageBody = body.trim();
    if (!messageBody || sending || !thread) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, participantId: thread.participant.id, body: messageBody }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "消息发送失败");
      setBody("");
      await loadThread();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "消息发送失败");
    } finally {
      setSending(false);
    }
  };

  return <main className="zuji-page zuji-black-yellow-theme">
    <SiteHeader active="messages" userName={userName} authMethod={authMethod} />
    <section className="zuji-message-page zuji-container">
      <div className="zuji-page-context zuji-message-back"><Link href="/messages"><i aria-hidden="true">←</i><b>返回消息中心</b></Link><span>对话详情</span></div>
      {loading ? <div className="zuji-message-loading">正在打开对话…</div> : error && !thread ? <div className="zuji-profile-error"><b>无法打开这段对话</b><p>{error}</p><button onClick={() => void loadThread(true)}>重新加载</button></div> : thread && <div className="zuji-message-layout">
        <aside className="zuji-message-listing">
          <span>围绕这套房沟通</span>
          <h1>{thread.listing.title}</h1>
          <p>{thread.listing.district} · {thread.listing.community}</p>
          <strong>¥{(thread.listing.monthlyRentCents / 100).toLocaleString()}<small>/月</small></strong>
          <Link href={`/listings/${thread.listing.id}`}>查看房源详情 →</Link>
          <div><b>沟通提醒</b><p>不要发送身份证号、银行卡或验证码，看房前不要转账。</p></div>
        </aside>
        <section className="zuji-thread-card">
          <header><div className="zuji-thread-avatar">{thread.participant.label.slice(0, 1)}</div><div><b>{thread.participant.label}</b><span><i /> 站内安全沟通</span></div><button onClick={() => void loadThread()}>刷新</button></header>
          <div className="zuji-thread-messages" aria-live="polite">
            {!thread.messages.length && <div className="zuji-thread-empty"><b>还没有消息</b><p>先问清楚租期、室友、家具和看房时间，再决定下一步。</p></div>}
            {thread.messages.map((message) => <article key={message.id} className={message.mine ? "mine" : "theirs"}><div>{message.body}</div><small>{message.createdAt.slice(0, 16).replace("T", " ")}{message.mine && <> · {message.readAt ? "已读" : "未读"}</>}</small></article>)}
            <div ref={endRef} />
          </div>
          <footer>
            {error && <div className="zuji-thread-error">{error}</div>}
            <textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} maxLength={1000} rows={3} placeholder="输入消息，按 Enter 发送，Shift + Enter 换行" />
            <div><span>{body.length}/1000</span><button disabled={!body.trim() || sending} onClick={() => void sendMessage()}>{sending ? "发送中…" : "发送消息"}</button></div>
          </footer>
        </section>
      </div>}
    </section>
  </main>;
}
