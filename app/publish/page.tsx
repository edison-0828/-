"use client";

import { useState } from "react";
import PublisherWorkspace from "../PublisherWorkspace";
import IdentityVerificationFlow from "../IdentityVerificationFlow";
import SiteHeader from "../_components/SiteHeader";

export default function PublishPage() {
  const [verified, setVerified] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  return <main className="zuji-page zuji-orange-theme"><SiteHeader active="publish" /><PublisherWorkspace verified={verified} onBack={() => { window.location.href = "/"; }} onStartVerification={() => setShowIdentity(true)} />{showIdentity && <IdentityVerificationFlow onClose={() => setShowIdentity(false)} onComplete={() => { setVerified(true); setShowIdentity(false); }} />}</main>;
}
