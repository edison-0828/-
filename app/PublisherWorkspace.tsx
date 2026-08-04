"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

const copy = {
  eyebrow: "\u6211\u8981\u8f6c\u79df \u00b7 \u53d1\u5e03\u5de5\u4f5c\u53f0",
  title: "\u628a\u771f\u5b9e\u7684\u79df\u8d41\u7ecf\u5386\uff0c",
  title2: "\u4ea4\u7ed9\u4e0b\u4e00\u4e2a\u79df\u5ba2\u3002",
  intro: "\u5148\u586b\u5199\u623f\u6e90\u4fe1\u606f\uff0c\u518d\u4e3a\u8fd9\u5957\u623f\u6e90\u63d0\u4ea4\u5bf9\u5e94\u7684\u79df\u8d41\u8bc1\u660e\u3002",
  info: "\u623f\u6e90\u4fe1\u606f",
  infoHint: "\u8fd9\u4e9b\u5185\u5bb9\u4f1a\u5c55\u793a\u7ed9\u6b63\u5728\u627e\u623f\u7684\u79df\u5ba2",
  titleLabel: "\u623f\u6e90\u6807\u9898",
  area: "\u533a\u57df\u4e0e\u5c0f\u533a",
  rent: "\u6708\u79df\u91d1",
  available: "\u53ef\u5165\u4f4f\u65f6\u95f4",
  expiry: "\u79df\u7ea6\u5230\u671f\u65f6\u95f4",
  note: "\u8f6c\u79df\u8bf4\u660e",
  proof: "\u672c\u5957\u623f\u6e90\u7684\u79df\u8d41\u8bc1\u660e",
  proofHint: "\u5408\u540c\u9700\u8981\u4e0e\u672c\u5957\u623f\u6e90\u5339\u914d\uff0c\u6bcf\u53d1\u5e03\u65b0\u623f\u6e90\u90fd\u9700\u91cd\u65b0\u63d0\u4ea4",
  contract: "\u4e0a\u4f20\u79df\u8d41\u5408\u540c",
  contractHint: "PDF\u3001JPG\u3001PNG\uff0c\u7528\u4e8e\u6838\u5bf9\u672c\u5957\u623f\u6e90",
  payment: "\u79df\u91d1\u652f\u4ed8\u8bb0\u5f55",
  paymentHint: "\u53ef\u9009\uff0c\u4e0a\u4f20\u8fd1 3\u20136 \u4e2a\u6708\u53ef\u83b7\u5f97\u4f18\u5148\u66dd\u5149",
  images: "\u623f\u6e90\u56fe\u7247",
  imagesHint: "\u6700\u591a 8 \u5f20\uff0c\u7b2c\u4e00\u5f20\u4f5c\u4e3a\u5c01\u9762",
  checklist: "\u53d1\u5e03\u68c0\u67e5\u6e05\u5355",
  identity: "\u8eab\u4efd\u8ba4\u8bc1",
  identityDone: "\u8d26\u6237\u5df2\u5b8c\u6210\uff0c\u53ef\u590d\u7528",
  identityTodo: "\u63d0\u4ea4\u65f6\u5b8c\u6210",
  contractDone: "\u672c\u5957\u623f\u6e90\u5408\u540c\u5df2\u9009\u62e9",
  contractTodo: "\u8bf7\u4e0a\u4f20\u5bf9\u5e94\u5408\u540c",
  submit: "\u63d0\u4ea4\u5ba1\u6838",
  submitting: "\u63d0\u4ea4\u4e2d\u2026",
  preview: "\u9884\u89c8\u623f\u6e90",
  back: "\u8fd4\u56de\u627e\u623f",
};

type Props = { verified: boolean; onBack: () => void; onStartVerification: () => void };
type FileItem = { name: string; url: string };

export default function PublisherWorkspace({ verified, onBack, onStartVerification }: Props) {
  const [form, setForm] = useState({ title: "", area: "", rent: "", date: "", expiry: "", note: "" });
  const [images, setImages] = useState<FileItem[]>([]);
  const [contractFile, setContractFile] = useState("");
  const [paymentFiles, setPaymentFiles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const chooseImages = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    const selected = incoming.slice(0, Math.max(0, 8 - images.length)).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setImages((current) => [...current, ...selected]);
    if (incoming.length > selected.length) setError("\u623f\u6e90\u56fe\u7247\u6700\u591a\u4e0a\u4f20 8 \u5f20\u3002");
    event.currentTarget.value = "";
  };

  const choosePaymentFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files || []).map((file) => file.name);
    setPaymentFiles((current) => Array.from(new Set([...current, ...names])).slice(0, 6));
    event.currentTarget.value = "";
  };

  const submit = async () => {
    if (!verified) return onStartVerification();
    if (!contractFile) return setError("\u8bf7\u5148\u4e0a\u4f20\u672c\u5957\u623f\u6e90\u7684\u79df\u8d41\u5408\u540c\u3002");
    const area = form.area.trim();
    const [district = area, community = district] = area.split("·").map((part) => part.trim());
    const rent = Number(form.rent.replace(/[^0-9.]/g, ""));
    if (!form.title.trim() || !area || !rent || !form.date || !form.expiry) return setError("\u8bf7\u8865\u5145\u5b8c\u6574\u7684\u623f\u6e90\u4fe1\u606f\u3002");
    if (form.expiry < form.date) return setError("\u79df\u7ea6\u5230\u671f\u65e5\u4e0d\u80fd\u65e9\u4e8e\u5165\u4f4f\u65e5\u3002");
    setError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/listings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: form.title.trim(), district, community, monthlyRentCents: Math.round(rent * 100), availableFrom: form.date, leaseEndsAt: form.expiry, description: form.note.trim(), contractFileName: contractFile, paymentFileNames: paymentFiles, imageNames: images.map((image) => image.name) }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) return setError(payload.error || "\u63d0\u4ea4\u5ba1\u6838\u5931\u8d25\u3002");
      setSubmitted(true);
    } catch { setError("\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002"); } finally { setSubmitting(false); }
  };

  if (submitted) return <section className="publisher-shell shell"><div className="success-card"><div className="success-icon">✓</div><p className="eyebrow">{"\u63d0\u4ea4\u6210\u529f"}</p><h1>{"\u623f\u6e90\u6b63\u5728\u5ba1\u6838\u4e2d"}</h1><p>{"\u8eab\u4efd\u9a8c\u8bc1\u4e0e\u672c\u5957\u623f\u6e90\u7684\u5408\u540c\u5df2\u5206\u5f00\u8bb0\u5f55\u3002"}</p><button className="dark-button full" onClick={onBack}>{copy.back} <span>→</span></button></div></section>;

  return <section className="publisher-shell shell"><div className="publisher-head"><div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}<br /><i>{copy.title2}</i></h1><p>{copy.intro}</p></div><button className="back-link" onClick={onBack}>← {copy.back}</button></div><div className="publisher-layout"><div className="publish-form publish-form-v2"><section className="form-section"><div className="form-section-heading"><span>01</span><div><h2>{copy.info}</h2><p>{copy.infoHint}</p></div></div><label>{copy.titleLabel}<input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="\u4f8b\u5982\uff1a\u540e\u6d77\u65c1\u7684\u5b89\u9759\u6b21\u5367" /></label><div className="form-row"><label>{copy.area}<input value={form.area} onChange={(event) => update("area", event.target.value)} placeholder="\u4f8b\u5982\uff1a\u5357\u5c71 · \u540e\u6d77" /></label><label>{copy.rent}<input value={form.rent} onChange={(event) => update("rent", event.target.value)} placeholder="¥ 3,600" /></label></div><div className="form-row"><label>{copy.available}<input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label><label>{copy.expiry}<input type="date" value={form.expiry} min={form.date || undefined} onChange={(event) => update("expiry", event.target.value)} /></label></div><label>{copy.note}<textarea value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="\u4ecb\u7ecd\u623f\u95f4\u3001\u5ba4\u53cb\u3001\u5468\u8fb9\u548c\u4f60\u5e0c\u671b\u7684\u79df\u5ba2\u2026" rows={4} /></label></section><section className="form-section"><div className="form-section-heading"><span>02</span><div><h2>{copy.proof}</h2><p>{copy.proofHint}</p></div></div><label className={`proof-upload ${contractFile ? "ready" : ""}`}><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setContractFile(event.target.files?.[0]?.name || "")} /><span className="proof-upload-icon">{contractFile ? "✓" : "↑"}</span><span className="proof-upload-copy"><b>{contractFile || copy.contract}</b><small>{copy.contractHint}</small></span><span className="proof-upload-action">{contractFile ? "\u5df2\u9009\u62e9" : "\u9009\u62e9\u6587\u4ef6"}</span></label><label className="proof-upload optional-proof"><input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={choosePaymentFiles} /><span className="proof-upload-icon">＋</span><span className="proof-upload-copy"><b>{copy.payment}</b><small>{copy.paymentHint}</small></span><span className="proof-upload-action">{paymentFiles.length ? `${paymentFiles.length} \u4efd` : "\u53ef\u9009"}</span></label></section><section className="form-section"><div className="form-section-heading"><span>03</span><div><h2>{copy.images}</h2><p>{copy.imagesHint}</p></div></div><div className="image-grid-v2"><label className="image-add-tile"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseImages} /><span>＋</span><small>{images.length}/8</small></label>{images.map((image, index) => <div className="image-tile-v2" key={image.url}><img src={image.url} alt={image.name} />{index === 0 && <b>\u5c01\u9762</b>}<button type="button" onClick={() => { URL.revokeObjectURL(image.url); setImages((current) => current.filter((item) => item.url !== image.url)); }}>×</button></div>)}</div></section>{error && <div className="form-error">! {error}</div>}<div className="form-actions form-actions-v2"><button className="back-link" onClick={onBack}>{copy.back}</button><button className="preview-button" type="button">{copy.preview}</button><button className="dark-button" disabled={submitting} onClick={submit}>{submitting ? copy.submitting : copy.submit} <span>→</span></button></div></div><aside className="publisher-side publisher-side-v2"><div className="checklist-card"><span className="side-label">{copy.checklist}</span><div className="checklist-line"><span className={`checklist-icon ${verified ? "done" : ""}`}>{verified ? "✓" : "01"}</span><div><b>{copy.identity}</b><small>{verified ? copy.identityDone : copy.identityTodo}</small></div></div><div className="checklist-line"><span className={`checklist-icon ${contractFile ? "done" : ""}`}>{contractFile ? "✓" : "02"}</span><div><b>{copy.proof}</b><small>{contractFile ? copy.contractDone : copy.contractTodo}</small></div></div><div className="checklist-line"><span className={`checklist-icon ${images.length ? "done" : ""}`}>{images.length ? "✓" : "03"}</span><div><b>{copy.images}</b><small>{images.length ? `${images.length}/8` : "\u53ef\u9009\uff0c\u5efa\u8bae\u81f3\u5c11 1 \u5f20"}</small></div></div></div><div className="side-tip"><b>{"\u53d1\u5e03\u524d\u63d0\u9192"}</b><p>{"\u8eab\u4efd\u8ba4\u8bc1\u53ef\u4ee5\u590d\u7528\uff0c\u4f46\u5408\u540c\u5fc5\u987b\u4e0e\u5f53\u524d\u623f\u6e90\u5339\u914d\u3002"}</p></div></aside></div></section>;
}
