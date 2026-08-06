"use client";

import { useEffect, useState } from "react";
import PublisherWorkspace from "../PublisherWorkspace";
import SiteHeader from "../_components/SiteHeader";

export default function PublishPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session").then((response) => response.json()).then((payload: { user: { displayName: string } | null }) => {
      setAuthenticated(Boolean(payload.user));
      setUserName(payload.user?.displayName || null);
    }).catch(() => null);
  }, []);

  const login = () => { window.location.href = "/signin-with-chatgpt?return_to=/publish"; };

  return <main className="zuji-page zuji-orange-theme">
    <SiteHeader active="publish" userName={userName} />
    <PublisherWorkspace authenticated={authenticated} onBack={() => { window.location.href = "/"; }} onRequireLogin={login} />
  </main>;
}
