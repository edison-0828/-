"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

const copy = {
  eyebrow: "\u53d1\u5e03\u524d\u7684\u8eab\u4efd\u9a8c\u8bc1",
  title: "\u5148\u8bc1\u660e\u4f60\u662f\u8c01",
  description: "\u5b9e\u540d\u8ba4\u8bc1\u53ea\u9700\u5b8c\u6210\u4e00\u6b21\uff0c\u4e4b\u540e\u53ef\u7528\u4e8e\u53d1\u5e03\u591a\u5957\u623f\u6e90\u3002",
  identity: "\u8eab\u4efd\u8bc1\u4ef6",
  face: "\u672c\u4eba\u6d3b\u4f53\u9a8c\u8bc1",
  continue: "\u5b8c\u6210\u8eab\u4efd\u8ba4\u8bc1",
  privacy: "\u8eab\u4efd\u6750\u6599\u4ec5\u7528\u4e8e\u9a8c\u8bc1\uff0c\u4e0d\u4f1a\u516c\u5f00\u5c55\u793a\u3002",
};

export default function IdentityVerificationFlow({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [identityFile, setIdentityFile] = useState("");
  const [faceFile, setFaceFile] = useState("");
  const choose = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => setter(event.target.files?.[0]?.name || "");
  const ready = Boolean(identityFile && faceFile);
  return <div className="modal-backdrop" onClick={onClose}><div className="modal publish-flow" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><p className="eyebrow">{copy.eyebrow}</p><div className="flow-progress"><span className="done" /></div><div className="flow-icon">◎</div><h2>{copy.title}</h2><p className="modal-copy">{copy.description}</p><div className="verification-upload"><label className={`upload-tile ${identityFile ? "ready" : ""}`}><input type="file" accept="image/*" onChange={choose(setIdentityFile)} /><span>{identityFile ? "✓" : "＋"}</span><b>{identityFile || copy.identity}</b><small>JPG、PNG</small></label><label className={`upload-tile ${faceFile ? "ready" : ""}`}><input type="file" accept="image/*" capture="user" onChange={choose(setFaceFile)} /><span>{faceFile ? "✓" : "＋"}</span><b>{faceFile || copy.face}</b><small>JPG、PNG</small></label></div><div className="flow-check"><span>✓</span><div><b>{copy.privacy}</b></div></div><button className="dark-button full" disabled={!ready} onClick={onComplete}>{copy.continue} <span>→</span></button></div></div>;
}
