"use client";

import PublisherWorkspace from "../PublisherWorkspace";
import SiteHeader from "../_components/SiteHeader";

export default function PublishClient({ userName, authenticated, authMethod }: { userName: string; authenticated: boolean; authMethod: "chatgpt" | "demo" | null }) {
  return <main className="zuji-page zuji-black-yellow-theme">
    <SiteHeader active="publish" userName={authenticated ? userName : null} authMethod={authMethod} />
    <PublisherWorkspace authenticated={authenticated} onBack={() => { window.location.href = "/"; }} />
  </main>;
}
