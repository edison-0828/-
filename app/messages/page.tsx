import { redirect } from "next/navigation";
import SiteHeader from "../_components/SiteHeader";
import Link from "../_components/SafeLink";
import { getChatGPTUser } from "../chatgpt-auth";
import MessageInboxClient from "./MessageInboxClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getChatGPTUser();
  if (!user) redirect("/login?return_to=/messages");

  return <main className="zuji-page zuji-black-yellow-theme">
    <SiteHeader active="messages" userName={user.displayName} authMethod={user.authMethod} />
    <section className="zuji-inbox-page zuji-container">
      <div className="zuji-page-context">
        <Link href="/"><i aria-hidden="true">←</i><b>返回找房</b></Link>
        <span>消息中心</span>
      </div>
      <header className="zuji-inbox-heading">
        <span>站内消息</span>
        <h1>和房源发布者<br />继续沟通</h1>
        <p>所有咨询按房源整理在这里，未读消息会优先显示。</p>
      </header>
      <MessageInboxClient />
    </section>
  </main>;
}
