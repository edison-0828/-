import { chatGPTSignOutPath, getChatGPTUser, isDemoAuthEnabled } from "../chatgpt-auth";
import Link from "../_components/SafeLink";
import LoginMethods from "./LoginMethods";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const requested = (await searchParams).return_to || "/";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  const user = await getChatGPTUser();
  const demoMode = isDemoAuthEnabled();

  return <main className="zuji-login-page">
    <header className="zuji-login-header"><div className="zuji-login-container">
      <Link className="zuji-brand" href="/"><span>租</span><b>租迹 <em>ZUJI</em></b></Link>
    </div></header>

    <section className="zuji-login-shell zuji-login-container">
      <aside className="zuji-login-intro">
        <span>租迹账号</span>
        <h1>登录更简单，<br />找房更安心。</h1>
        <p>使用微信或手机号快速进入租迹。收藏房源、预约看房，发布自己的真实转租信息。</p>
        <div className="zuji-login-benefits">
          <div><b>01</b><span><strong>两种熟悉的登录方式</strong><small>微信扫码，或手机号验证码快速进入</small></span></div>
          <div><b>02</b><span><strong>登录不等于实名认证</strong><small>浏览和填写发布信息时不会强制认证</small></span></div>
          <div><b>03</b><span><strong>个人信息不会公开</strong><small>手机号仅用于登录和必要的安全通知</small></span></div>
        </div>
        <div className="zuji-login-stamp">ZUJI<br />住得明白</div>
      </aside>

      <section className="zuji-login-card">
        {user ? <>
          <div className="zuji-login-mark">租</div>
          <span>账号已连接</span>
          <h2>你已经登录</h2>
          <p>当前账号可以继续收藏、联系和发布房源。</p>
          <div className="zuji-login-account"><small>当前账号</small><b>{user.displayName}</b><span>{user.email}</span></div>
          <Link className="zuji-login-primary" href={returnTo}>继续使用租迹 <span>→</span></Link>
          <a className="zuji-login-secondary" href={user.authMethod === "demo" ? "/api/demo-auth/logout?return_to=/" : chatGPTSignOutPath("/")}>退出当前账号</a>
        </> : <LoginMethods returnTo={returnTo} demoMode={demoMode} />}
      </section>
    </section>

    <footer className="zuji-login-footer"><div className="zuji-login-container"><span>© 2026 ZUJI</span><p>让转租回到租客之间。</p></div></footer>
  </main>;
}
