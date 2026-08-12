"use client";

import Link from "./SafeLink";

export type NavigationDestination = "find" | "publish" | "market" | "messages" | "profile";

export default function BottomNavigation({ active, userName, unreadMessages = 0 }: { active?: NavigationDestination; userName?: string | null; unreadMessages?: number }) {
  const profileHref = userName ? "/profile" : "/login?return_to=%2Fprofile";
  const profileActive = active === "profile" || active === "messages";

  return <nav className="zuji-mobile-nav" aria-label="主要导航">
    <Link aria-current={active === "find" ? "page" : undefined} className={active === "find" ? "active" : ""} href="/"><i aria-hidden="true">⌂</i><b>找房</b></Link>
    <Link aria-current={active === "publish" ? "page" : undefined} className={active === "publish" ? "active" : ""} href="/publish"><i aria-hidden="true">＋</i><b>发布</b></Link>
    <Link aria-current={active === "market" ? "page" : undefined} className={active === "market" ? "active" : ""} href="/market">
      <i className="zuji-nav-icon zuji-nav-chart" aria-hidden="true"><span /><span /><span /></i>
      <b>行情</b>
    </Link>
    <Link aria-current={profileActive ? "page" : undefined} className={profileActive ? "active" : ""} href={profileHref}>
      <i className="zuji-nav-icon zuji-nav-person" aria-hidden="true">{unreadMessages > 0 && <em>{unreadMessages > 99 ? "99+" : unreadMessages}</em>}</i>
      <b>我的</b>
    </Link>
  </nav>;
}
