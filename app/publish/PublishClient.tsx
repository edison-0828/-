"use client";

import PublisherWorkspace from "../PublisherWorkspace";
import SiteHeader from "../_components/SiteHeader";

export default function PublishClient({ userName, authenticated }: { userName: string; authenticated: boolean }) {
  return <main className="zuji-page zuji-orange-theme">
    <SiteHeader active="publish" userName={userName} />
    <PublisherWorkspace authenticated={authenticated} onBack={() => { window.location.href = "/"; }} />
  </main>;
}
