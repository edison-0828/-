"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "../_components/SafeLink";

type Tab = "listings" | "favorites" | "viewings";
type ListingItem = { id: string; title: string; district: string; community: string; monthlyRentCents: number; availableFrom: string; status: string; createdAt: string };
type FavoriteItem = { id: string; title: string; district: string; community: string; monthlyRentCents: number; availableFrom: string; savedAt: string };
type ViewingItem = { id: string; listingId: string; listingTitle: string; requestedDate: string; requestedTime: string; note: string; publisherNote: string; status: string; role: "seeker" | "publisher"; createdAt: string };
type ProfileData = { listings: ListingItem[]; favorites: FavoriteItem[]; viewings: ViewingItem[] };

const listingStatusText: Record<string, string> = { pending_review: "审核中", published: "已发布", rejected: "需修改", closed: "已结束" };
const viewingStatusText: Record<string, string> = { pending: "待确认", confirmed: "已确认", rejected: "已拒绝", rescheduled: "已改期", cancelled: "已取消" };

export default function ProfileDashboard({ initialTab = "listings" }: { initialTab?: Tab }) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingBusyId, setViewingBusyId] = useState("");
  const [rescheduleId, setRescheduleId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [publisherNote, setPublisherNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/login?return_to=/profile";
        return;
      }
      const payload = await response.json() as ProfileData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "个人中心加载失败");
      setData(payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "个人中心加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialTimer);
  }, [load]);

  const chooseTab = (tab: Tab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const removeFavorite = async (listingId: string) => {
    const response = await fetch(`/api/favorites?listingId=${encodeURIComponent(listingId)}`, { method: "DELETE" });
    if (!response.ok) return;
    setData((current) => current ? { ...current, favorites: current.favorites.filter((item) => item.id !== listingId) } : current);
  };

  const handleViewing = async (item: ViewingItem, action: "confirm" | "reject" | "reschedule") => {
    if (viewingBusyId) return;
    setViewingBusyId(item.id);
    setError("");
    try {
      const response = await fetch(`/api/viewing-requests/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, requestedDate: rescheduleDate, requestedTime: rescheduleTime, publisherNote }),
      });
      const payload = await response.json() as { request?: ViewingItem; error?: string };
      if (!response.ok || !payload.request) throw new Error(payload.error || "预约处理失败");
      setData((current) => current ? { ...current, viewings: current.viewings.map((viewing) => viewing.id === item.id ? { ...viewing, ...payload.request } : viewing) } : current);
      setRescheduleId("");
      setPublisherNote("");
      window.dispatchEvent(new Event("zuji:notifications-changed"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "预约处理失败");
    } finally {
      setViewingBusyId("");
    }
  };

  const beginReschedule = (item: ViewingItem) => {
    setRescheduleId(item.id);
    setRescheduleDate(item.requestedDate);
    setRescheduleTime(item.requestedTime);
    setPublisherNote("");
  };

  if (loading) return <div className="zuji-profile-loading"><span /><span /><span /></div>;
  if (!data) return <div className="zuji-profile-error"><b>个人数据暂时无法加载</b><p>{error}</p><button onClick={() => void load()}>重新加载</button></div>;

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "listings", label: "我的发布", count: data.listings.length },
    { id: "favorites", label: "我的收藏", count: data.favorites.length },
    { id: "viewings", label: "看房预约", count: data.viewings.length },
  ];

  return <section className="zuji-profile-dashboard">
    <nav aria-label="个人中心分类">{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => chooseTab(tab.id)}><span>{tab.label}</span><b>{tab.count}</b></button>)}</nav>

    <div className="zuji-profile-panel">
      {error && <div className="zuji-profile-inline-error">{error}<button onClick={() => setError("")}>×</button></div>}
      {activeTab === "listings" && <><PanelHead title="我的发布" copy="查看房源审核与公开状态" action={<Link href="/publish">发布新房源</Link>} />{data.listings.length ? <div className="zuji-profile-records">{data.listings.map((item) => <Link className="zuji-profile-record" key={item.id} href={`/listings/${item.id}`}><div><span className={`status ${item.status}`}>{listingStatusText[item.status] || item.status}</span><h3>{item.title}</h3><p>{item.district} · {item.community}　{item.availableFrom} 起可入住</p></div><strong>¥{(item.monthlyRentCents / 100).toLocaleString()}<small>/月</small></strong></Link>)}</div> : <EmptyState title="还没有发布房源" copy="把位置、租金和租期说清楚，就可以提交审核。" action="去发布" href="/publish" />}</>}

      {activeTab === "favorites" && <><PanelHead title="我的收藏" copy="换设备或刷新页面也不会丢失" />{data.favorites.length ? <div className="zuji-profile-records">{data.favorites.map((item) => <article className="zuji-profile-record" key={item.id}><Link href={`/listings/${item.id}`}><span className="status published">已收藏</span><h3>{item.title}</h3><p>{item.district} · {item.community}　{item.availableFrom} 起可入住</p></Link><strong>¥{(item.monthlyRentCents / 100).toLocaleString()}<small>/月</small></strong><button onClick={() => void removeFavorite(item.id)}>取消收藏</button></article>)}</div> : <EmptyState title="还没有收藏房源" copy="看到合适的房源，点击爱心就会保存在这里。" action="去找房" href="/#listings" />}</>}

      {activeTab === "viewings" && <><PanelHead title="看房预约" copy="转租者可以确认、拒绝或提出新的时间" />{data.viewings.length ? <div className="zuji-viewing-list">{data.viewings.map((item) => <article className="zuji-viewing-record" key={item.id}><header><span>{item.role === "seeker" ? "我发起的预约" : "收到看房预约"}</span><em className={`status ${item.status}`}>{viewingStatusText[item.status] || item.status}</em></header><Link href={`/listings/${item.listingId}`}><h3>{item.listingTitle}</h3><p><b>{item.requestedDate}</b><b>{item.requestedTime}</b>{item.note && <span>{item.note}</span>}</p></Link>{item.publisherNote && <div className="zuji-viewing-note"><b>转租者留言</b><span>{item.publisherNote}</span></div>}{item.role === "publisher" && item.status === "pending" && <div className="zuji-viewing-actions"><button disabled={viewingBusyId === item.id} onClick={() => void handleViewing(item, "confirm")}>确认时间</button><button disabled={viewingBusyId === item.id} onClick={() => beginReschedule(item)}>修改时间</button><button className="reject" disabled={viewingBusyId === item.id} onClick={() => void handleViewing(item, "reject")}>无法接待</button></div>}{rescheduleId === item.id && <div className="zuji-reschedule-form"><label>新的日期<input type="date" value={rescheduleDate} onChange={(event) => setRescheduleDate(event.target.value)} /></label><label>新的时间<input type="time" value={rescheduleTime} onChange={(event) => setRescheduleTime(event.target.value)} /></label><label className="note">给找房者留言<input value={publisherNote} maxLength={500} onChange={(event) => setPublisherNote(event.target.value)} placeholder="例如：晚上 7 点后更方便" /></label><div><button onClick={() => setRescheduleId("")}>取消</button><button className="submit" disabled={!rescheduleDate || !rescheduleTime || viewingBusyId === item.id} onClick={() => void handleViewing(item, "reschedule")}>发送新时间</button></div></div>}</article>)}</div> : <EmptyState title="还没有看房预约" copy="选中房源后，可以直接提交希望看房的日期和时间。" action="浏览房源" href="/#listings" />}</>}
    </div>
  </section>;
}

function PanelHead({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <header className="zuji-profile-panel-head"><div><h2>{title}</h2><p>{copy}</p></div>{action}</header>;
}

function EmptyState({ title, copy, action, href }: { title: string; copy: string; action: string; href: string }) {
  return <div className="zuji-profile-empty"><b>{title}</b><p>{copy}</p><Link href={href}>{action} →</Link></div>;
}
