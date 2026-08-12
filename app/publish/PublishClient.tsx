"use client";

import { useRouter } from "next/navigation";
import PublisherWorkspace from "../PublisherWorkspace";
import { announceRouteStart } from "../_components/SafeLink";

export default function PublishClient({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();
  return <main className="zuji-page zuji-black-yellow-theme">
    <PublisherWorkspace authenticated={authenticated} onBack={() => { announceRouteStart("/"); router.push("/"); }} />
  </main>;
}
