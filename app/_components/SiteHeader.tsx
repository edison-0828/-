"use client";

import { useEffect, useRef, useState } from "react";
import BottomNavigation from "./BottomNavigation";
import type { NavigationDestination } from "./BottomNavigation";
import Link from "./SafeLink";

type AuthMethod = "chatgpt" | "demo";
type Props = { active: NavigationDestination; userName?: string | null; authMethod?: AuthMethod | null };

export default function SiteHeader({ active, userName, authMethod }: Props) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unreadMessages: 0, pendingViewings: 0, total: 0 });
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!userName) return;
    const loadNotifications = () => {
      fetch("/api/notifications", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { unreadMessages?: number; pendingViewings?: number; total?: number }) => setNotifications({ unreadMessages: payload.unreadMessages || 0, pendingViewings: payload.pendingViewings || 0, total: payload.total || 0 }))
        .catch(() => setNotifications({ unreadMessages: 0, pendingViewings: 0, total: 0 }));
    };
    loadNotifications();
    window.addEventListener("focus", loadNotifications);
    window.addEventListener("zuji:notifications-changed", loadNotifications);
    return () => {
      window.removeEventListener("focus", loadNotifications);
      window.removeEventListener("zuji:notifications-changed", loadNotifications);
    };
  }, [userName]);

  const goToLogin = () => {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?return_to=${encodeURIComponent(returnTo)}`;
  };
  const logoutHref = authMethod === "demo" ? "/api/demo-auth/logout?return_to=/" : "/signout-with-chatgpt?return_to=/";
  const initial = userName?.trim().slice(0, 1).toUpperCase() || "我";
  const notificationHref = notifications.unreadMessages ? "/messages" : "/profile?tab=viewings";
  const notificationText = notifications.unreadMessages ? `${notifications.unreadMessages} 条未读消息` : `${notifications.pendingViewings} 个预约待处理`;
  const messagesHref = userName ? "/messages" : "/login?return_to=%2Fmessages";
  const profileHref = userName ? "/profile" : "/login?return_to=%2Fprofile";

  return <>
    <header className="zuji-header">
      <div className="zuji-container zuji-header-inner">
        <Link className="zuji-brand" href="/" aria-label="租迹首页"><span>租</span><b>租迹 <em>ZUJI</em></b></Link>
        <nav className="zuji-role-switch" aria-label="使用模式">
          <Link aria-current={active === "find" ? "page" : undefined} className={active === "find" ? "active" : ""} href="/">我要找房</Link>
          <Link aria-current={active === "publish" ? "page" : undefined} className={active === "publish" ? "active" : ""} href="/publish">我要转租</Link>
        </nav>
        <div className="zuji-header-links">
          <Link className={`zuji-header-destination ${active === "market" ? "active" : ""}`} href="/market">行情</Link>
          {userName && <Link className={`zuji-header-destination ${active === "messages" ? "active" : ""}`} href={messagesHref}>消息{notifications.unreadMessages > 0 && <em>{notifications.unreadMessages > 99 ? "99+" : notifications.unreadMessages}</em>}</Link>}
          {userName && <Link className={`zuji-header-destination ${active === "profile" ? "active" : ""}`} href={profileHref}>个人中心</Link>}
          {userName === undefined ? <button disabled>识别中…</button> : userName ? <div className="zuji-account-menu" ref={accountRef}>
            <button className="zuji-account-trigger" type="button" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}><i>{initial}{notifications.total > 0 && <em>{notifications.total > 99 ? "99+" : notifications.total}</em>}</i><span>{userName}</span><b aria-hidden="true">⌄</b></button>
            {accountOpen && <div className="zuji-account-dropdown" role="menu">
              <div><i>{initial}</i><span><b>{userName}</b><small>{authMethod === "demo" ? "Demo 演示账号" : "已登录账号"}</small></span></div>
              <Link role="menuitem" href={notifications.total ? notificationHref : "/profile"} onClick={() => setAccountOpen(false)}><span>个人中心{notifications.total > 0 && <em>{notificationText}</em>}</span><b>→</b></Link>
              <a role="menuitem" className="logout" href={logoutHref}><span>退出登录</span><b>↗</b></a>
            </div>}
          </div> : <button type="button" onClick={goToLogin}>登录</button>}
        </div>
      </div>
    </header>
    <BottomNavigation active={active} userName={userName} unreadMessages={userName ? notifications.unreadMessages : 0} />
  </>;
}
