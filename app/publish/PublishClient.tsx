"use client";

import PublisherWorkspace from "../PublisherWorkspace";
import SiteHeader from "../_components/SiteHeader";

export default function PublishClient({ userName }: { userName: string }) {
  return <main className="zuji-page zuji-orange-theme">
    <SiteHeader active="publish" userName={userName} />
    <PublisherWorkspace authenticated onBack={() => { window.location.href = "/"; }} onRequireLogin={() => { window.location.href = "/login?return_to=%2Fpublish"; }} />
  </main>;
}
