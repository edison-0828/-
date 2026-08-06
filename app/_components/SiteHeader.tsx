"use client";

import Link from "next/link";

type Props = { active: "find" | "publish"; userName?: string | null };

export default function SiteHeader({ active, userName }: Props) {
  return (
    <header className="zuji-header">
      <div className="zuji-container zuji-header-inner">
        <Link className="zuji-brand" href="/" aria-label="租迹首页"><span>租</span><b>租迹 <em>ZUJI</em></b></Link>
        <nav className="zuji-role-switch" aria-label="使用模式">
          <Link className={active === "find" ? "active" : ""} href="/">我要找房</Link>
          <Link className={active === "publish" ? "active" : ""} href="/publish">我要转租</Link>
        </nav>
        <div className="zuji-header-links"><Link href="/#trust">安心保障</Link><Link href="/#listings">浏览房源</Link><button disabled title="当前站点账号">{userName === undefined ? "识别中…" : userName || "当前账号"}</button></div>
      </div>
    </header>
  );
}
