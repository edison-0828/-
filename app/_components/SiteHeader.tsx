"use client";

type Props = { active: "find" | "publish"; userName?: string | null };

export default function SiteHeader({ active, userName }: Props) {
  const login = () => {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      window.location.href = "/signin-with-chatgpt?return_to=/";
    }
  };
  return <header className="zuji-header"><div className="zuji-container zuji-header-inner"><a className="zuji-brand" href="/" aria-label="租迹首页"><span>租</span><b>租迹 <em>ZUJI</em></b></a><nav className="zuji-role-switch" aria-label="使用模式"><a className={active === "find" ? "active" : ""} href="/">我要找房</a><a className={active === "publish" ? "active" : ""} href="/publish">我要转租</a></nav><div className="zuji-header-links"><a href="/#trust">信任机制</a><a href="/#listings">房源</a><button onClick={login}>{userName || "登录"}</button></div></div></header>;
}
