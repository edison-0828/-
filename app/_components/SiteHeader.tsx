"use client";

import Link from "next/link";

type Props = { active: "find" | "publish"; userName?: string | null };

export default function SiteHeader({ active, userName }: Props) {
  const login = () => {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      window.location.href = "/signin-with-chatgpt?return_to=/";
    }
  };

  return (
    <header className="zuji-header">
      <div className="zuji-container zuji-header-inner">
        <Link className="zuji-brand" href="/" aria-label="租迹首页"><span>租</span><b>租迹 <em>ZUJI</em></b></Link>
        <nav className="zuji-role-switch" aria-label="使用模式">
          <Link className={active === "find" ? "active" : ""} href="/">我要找房</Link>
          <Link className={active === "publish" ? "active" : ""} href="/publish">我要转租</Link>
        </nav>
        <div className="zuji-header-links"><Link href="/#trust">安心保障</Link><Link href="/#listings">浏览房源</Link><Link className="zuji-mobile-publish" href="/publish">我要转租</Link><button onClick={login}>{userName || "登录"}</button></div>
      </div>
    </header>
  );
}
