"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

type Props = { authenticated: boolean; onBack: () => void };
type ImageItem = { file: File; name: string; url: string };
type FormState = { title: string; district: string; community: string; rent: string; date: string; expiry: string; note: string };

const emptyForm: FormState = { title: "", district: "", community: "", rent: "", date: "", expiry: "", note: "" };

export default function PublisherWorkspace({ authenticated, onBack }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [paymentFiles, setPaymentFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const rentValue = Number(form.rent.replace(/[^0-9.]/g, ""));
  const basicsReady = Boolean(form.title.trim() && form.district.trim() && form.community.trim() && rentValue && form.date && form.expiry);
  const completedSteps = useMemo(() => [basicsReady, Boolean(contractFile), images.length > 0].filter(Boolean).length, [basicsReady, contractFile, images.length]);

  const chooseImages = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    const available = Math.max(0, 8 - images.length);
    const selected = incoming.slice(0, available).map((file) => ({ file, name: file.name, url: URL.createObjectURL(file) }));
    setImages((current) => [...current, ...selected]);
    if (incoming.length > available) setError("房源图片最多上传 8 张，已保留前 8 张。");
    event.currentTarget.value = "";
  };

  const removeImage = (target: ImageItem) => {
    URL.revokeObjectURL(target.url);
    setImages((current) => current.filter((item) => item.url !== target.url));
  };

  const choosePaymentFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    setPaymentFiles((current) => [...current, ...incoming]
      .filter((file, index, all) => all.findIndex((item) => `${item.name}-${item.size}-${item.lastModified}` === `${file.name}-${file.size}-${file.lastModified}`) === index)
      .slice(0, 6));
    event.currentTarget.value = "";
  };

  const validate = () => {
    if (!form.title.trim()) return "请填写一个容易理解的房源标题。";
    if (!form.district.trim()) return "请填写房源所在区域。";
    if (!form.community.trim()) return "请填写小区名称。";
    if (!rentValue) return "请填写正确的月租金。";
    if (!form.date) return "请选择最早可入住时间。";
    if (!form.expiry) return "请选择当前租约到期时间。";
    if (form.expiry < form.date) return "租约到期时间不能早于可入住时间。";
    if (!contractFile) return "请上传与这套房源对应的租赁合同。";
    if (!images.length) return "请至少上传一张房源实拍图片。";
    return "";
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);
    if (!authenticated) return setError("当前站点账号状态未识别，请刷新页面后重试。");
    if (!contractFile) return;

    setError("");
    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("title", form.title.trim());
      body.set("district", form.district.trim());
      body.set("community", form.community.trim());
      body.set("monthlyRentCents", String(Math.round(rentValue * 100)));
      body.set("availableFrom", form.date);
      body.set("leaseEndsAt", form.expiry);
      body.set("description", form.note.trim());
      body.set("contract", contractFile);
      images.forEach((image) => body.append("images", image.file));
      paymentFiles.forEach((file) => body.append("payments", file));

      const response = await fetch("/api/listings", { method: "POST", body });
      const payload = await response.json() as { error?: string; listing?: { id: string } };
      if (!response.ok) return setError(payload.error || "提交审核失败，请稍后重试。");
      setSubmittedId(payload.listing?.id || "");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return <section className="zuji-publisher"><div className="zuji-container"><div className="zuji-publish-success">
      <span>✓</span><small>提交成功</small><h1>房源已进入审核</h1>
      <p>房源和实拍图片已经保存。你现在可以预览自己的房源，其他租客会在审核通过后看到它。</p>
      <div><b>接下来会发生什么？</b><ol><li>核对本套房源合同与地址</li><li>审核通过后进入公开找房列表</li><li>有租客联系时通过站内消息通知你</li></ol></div>
      <button onClick={() => { window.location.href = `/listings/${submittedId}`; }}>查看我的房源 <span>→</span></button>
    </div></div></section>;
  }

  return <section className="zuji-publisher"><div className="zuji-container">
    <header className="zuji-publisher-head"><div><span>我要转租 · 发布工作台</span><h1>发布一套真实房源</h1><p>先把房子介绍清楚，登录账号和本套房源合同会分别确认。</p></div><button onClick={onBack}>← 返回找房</button></header>
    <div className="zuji-publish-progress">
      <Progress number="01" label="填写房源" done={basicsReady} />
      <Progress number="02" label="上传证明" done={Boolean(contractFile)} />
      <Progress number="03" label="添加图片" done={images.length > 0} />
      <small>{completedSteps}/3 已准备</small>
    </div>

    <div className="zuji-publisher-layout"><div className="zuji-publish-form">
      <PublishSection number="01" title="房源基本信息" hint="带 * 的内容会展示给找房用户，请尽量准确填写。">
        <label>房源标题 <Required /><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="例如：后海地铁站旁安静次卧，采光很好" maxLength={40} /><small className="zuji-field-help">一句话说清位置、房型或最大优点</small></label>
        <div className="zuji-form-row"><label>区域 <Required /><input value={form.district} onChange={(event) => update("district", event.target.value)} placeholder="例如：南山" /></label><label>小区 <Required /><input value={form.community} onChange={(event) => update("community", event.target.value)} placeholder="例如：蔚蓝海岸" /></label></div>
        <div className="zuji-form-row"><label>月租金 <Required /><div className="zuji-input-affix"><span>¥</span><input inputMode="decimal" value={form.rent} onChange={(event) => update("rent", event.target.value)} placeholder="3600" /><em>元/月</em></div></label><label>最早可入住 <Required /><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label></div>
        <label>当前租约到期 <Required /><input type="date" value={form.expiry} min={form.date || undefined} onChange={(event) => update("expiry", event.target.value)} /><small className="zuji-field-help">用于判断可转租时间，不会公开合同原件</small></label>
        <label>补充说明 <span className="zuji-optional">选填</span><textarea value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="可以介绍房间朝向、家具、室友、通勤和看房时间……" rows={5} /></label>
      </PublishSection>

      <PublishSection number="02" title="本套房源的租赁证明" hint="合同属于这套房，每发布一套新房都要重新匹配。原始文件不会公开。">
        <label className={`zuji-proof-upload ${contractFile ? "ready" : ""}`}><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => { setContractFile(event.target.files?.[0] || null); setError(""); }} /><span>{contractFile ? "✓" : "↑"}</span><p><b>{contractFile?.name || "上传租赁合同 *"}</b><small>支持 15MB 内的 PDF、JPG、PNG，仅用于审核</small></p><em>{contractFile ? "重新选择" : "选择文件"}</em></label>
        <label className="zuji-proof-upload optional"><input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={choosePaymentFiles} /><span>＋</span><p><b>补充租金支付记录</b><small>选填，近 3–6 个月记录可提升可信度</small></p><em>{paymentFiles.length ? `已选 ${paymentFiles.length} 份` : "可选"}</em></label>
        {paymentFiles.length > 0 && <div className="zuji-file-list">{paymentFiles.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}<button type="button" onClick={() => setPaymentFiles((current) => current.filter((item) => item !== file))}>×</button></span>)}</div>}
      </PublishSection>

      <PublishSection number="03" title="房源实拍图片" hint="至少 1 张，最多 8 张。第一张会作为房源封面。">
        <div className="zuji-image-grid"><label className="zuji-image-add"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseImages} /><b>＋</b><span>添加图片</span><small>{images.length}/8</small></label>{images.map((image, index) => <div className="zuji-image-item" key={image.url}><img src={image.url} alt={image.name} />{index === 0 && <b>封面</b>}<button type="button" aria-label={`移除 ${image.name}`} onClick={() => removeImage(image)}>×</button></div>)}</div>
      </PublishSection>

      {error && <div className="zuji-publish-error"><b>请检查发布信息</b><span>{error}</span></div>}
      <div className="zuji-publish-actions"><button className="preview" type="button" onClick={() => setPreview(true)} disabled={!form.title.trim()}>预览房源</button><p>{authenticated ? "✓ 发布账号已确认" : "提交前需要登录"}</p><button className="submit" disabled={submitting} onClick={submit}>{submitting ? "正在上传并提交…" : "提交审核"} <span>→</span></button></div>
    </div>

    <aside className="zuji-publish-aside"><div className="zuji-check-card"><span>发布检查</span>
      <CheckLine done={basicsReady} title="房源信息" description={basicsReady ? "必填内容已完整" : "还有必填内容未完成"} />
      <CheckLine done={Boolean(contractFile)} title="本套房源合同" description={contractFile ? "已选择审核材料" : "提交前必须上传"} />
      <CheckLine done={images.length > 0} title="实拍图片" description={images.length ? `已添加 ${images.length} 张` : "提交前至少添加 1 张"} />
      <CheckLine done={authenticated} title="发布账号" description={authenticated ? "已登录，可以提交" : "提交前需要登录"} />
    </div><div className="zuji-publish-tip"><b>材料如何使用？</b><p>登录账号确认发布归属；合同确认你与这套房的关系。合同和支付记录只用于审核，不会出现在公开页面。</p></div></aside>
    </div>

    {preview && <div className="zuji-preview-backdrop" onClick={() => setPreview(false)}><div className="zuji-preview" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setPreview(false)}>×</button><span>租客看到的房源卡片</span><div className="zuji-preview-photo">{images[0] ? <img src={images[0].url} alt="房源封面预览" /> : <p>添加房源图片后会显示在这里</p>}<b>合同待审核</b></div><small>{form.district || "区域"} · {form.community || "小区"}</small><h2>{form.title || "你的房源标题"}</h2><p>{form.date ? `${form.date} 起可入住` : "入住时间待填写"}</p><strong>¥{rentValue ? rentValue.toLocaleString() : "—"}<em>/月</em></strong><button onClick={() => setPreview(false)}>继续编辑</button></div></div>}
  </div></section>;
}

function Progress({ number, label, done }: { number: string; label: string; done: boolean }) {
  return <div><b>{number}</b><span>{label}</span><i className={done ? "done" : ""} /></div>;
}

function PublishSection({ number, title, hint, children }: { number: string; title: string; hint: string; children: ReactNode }) {
  return <section className="zuji-publish-section"><header><span>{number}</span><div><h2>{title}</h2><p>{hint}</p></div></header>{children}</section>;
}

function Required() { return <i className="zuji-required">*</i>; }

function CheckLine({ done, title, description }: { done: boolean; title: string; description: string }) {
  return <div className="zuji-check-line"><span className={done ? "done" : ""}>{done ? "✓" : "·"}</span><p><b>{title}</b><small>{description}</small></p></div>;
}
