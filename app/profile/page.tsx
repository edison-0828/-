import { redirect } from "next/navigation";
import SiteHeader from "../_components/SiteHeader";
import Link from "../_components/SafeLink";
import { getChatGPTUser } from "../chatgpt-auth";
import ProfileDashboard from "./ProfileDashboard";

export const dynamic = "force-dynamic";

const profileTabs = ["listings", "favorites", "viewings"] as const;

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getChatGPTUser();
  if (!user) redirect("/login?return_to=/profile");

  const initial = user.displayName.trim().slice(0, 1).toUpperCase() || "我";
  const requestedTab = (await searchParams).tab;
  if (requestedTab === "messages") redirect("/messages");
  const initialTab = profileTabs.find((tab) => tab === requestedTab) || "listings";

  return <main className="zuji-page zuji-black-yellow-theme">
    <SiteHeader active="profile" userName={user.displayName} authMethod={user.authMethod} />
    <section className="zuji-profile-page zuji-container">
      <div className="zuji-page-context"><Link href="/"><i aria-hidden="true">←</i><b>返回找房</b></Link><span>我的</span></div>
      <div className="zuji-profile-heading"><span>个人中心</span><h1>你好，{user.displayName}</h1><p>管理账号信息，并快速回到找房或转租流程。</p></div>
      <div className="zuji-profile-grid">
        <article className="zuji-profile-card">
          <div className="zuji-profile-avatar">{initial}</div>
          <div><small>当前账号</small><h2>{user.displayName}</h2><p>{user.email}</p><span>{user.authMethod === "demo" ? "Demo 演示账号" : "账号已登录"}</span></div>
        </article>
        <aside className="zuji-profile-actions">
          <Link href="/publish"><span><b>发布转租</b><small>填写或继续发布房源</small></span><strong>→</strong></Link>
          <Link href="/messages"><span><b>消息中心</b><small>查看咨询、未读消息和回复</small></span><strong>→</strong></Link>
          <Link href="/#listings"><span><b>继续找房</b><small>浏览当前可入住的房源</small></span><strong>→</strong></Link>
        </aside>
      </div>
      {user.authMethod === "demo" && <div className="zuji-profile-demo"><b>Demo 模式</b><p>当前账号用于本地流程测试，发布、收藏、消息和预约会写入本地测试数据。</p></div>}
      <ProfileDashboard initialTab={initialTab} />
    </section>
  </main>;
}
