"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "../_components/SafeLink";

type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  participantId: string;
  body: string;
  direction: "sent" | "received";
  createdAt: string;
  unreadCount: number;
};

export default function MessageInboxClient() {
  const [messages, setMessages] = useState<Conversation[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/login?return_to=/messages";
        return;
      }
      const payload = await response.json() as { messages?: Conversation[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "消息加载失败");
      setMessages(payload.messages || []);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "消息加载失败");
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (messages === null) return <div className="zuji-inbox-loading"><span /><span /><span /></div>;
  if (error) return <div className="zuji-profile-error"><b>暂时无法打开消息</b><p>{error}</p><button onClick={() => void load()}>重新加载</button></div>;
  if (!messages.length) return <div className="zuji-inbox-empty"><i aria-hidden="true">✉</i><b>还没有消息</b><p>在房源详情页点击“先问问发布者”，对话会保存在这里。</p><Link href="/#listings">去看看房源 →</Link></div>;

  return <div className="zuji-inbox-list">
    {messages.map((message) => <Link className={message.unreadCount ? "unread" : ""} href={`/messages/${message.listingId}?with=${encodeURIComponent(message.participantId)}`} key={`${message.listingId}-${message.participantId}`}>
      <div className="zuji-inbox-avatar" aria-hidden="true">{message.unreadCount ? message.unreadCount : "聊"}</div>
      <div><span>{message.unreadCount ? `${message.unreadCount} 条未读` : message.direction === "sent" ? "等待对方回复" : "已读消息"}</span><h2>{message.listingTitle}</h2><p>{message.body}</p></div>
      <time>{message.createdAt.slice(5, 10).replace("-", "/")}</time>
      <b aria-hidden="true">›</b>
    </Link>)}
  </div>;
}
