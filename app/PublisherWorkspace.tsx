"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

type Props = { verified: boolean; onBack: () => void; onStartVerification: () => void };
type FileItem = { name: string; url: string };
type FormState = {
  title: string;
  district: string;
  community: string;
  rent: string;
  date: string;
  expiry: string;
  note: string;
};

const emptyForm: FormState = { title: "", district: "", community: "", rent: "", date: "", expiry: "", note: "" };

export default function PublisherWorkspace({ verified, onBack, onStartVerification }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<FileItem[]>([]);
  const [contractFile, setContractFile] = useState("");
  const [paymentFiles, setPaymentFiles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const rentValue = Number(form.rent.replace(/[^0-9.]/g, ""));
  const basicsReady = Boolean(form.title.trim() && form.district.trim() && form.community.trim() && rentValue && form.date && form.expiry);
  const completedSteps = useMemo(() => [basicsReady, Boolean(contractFile), images.length > 0].filter(Boolean).length, [basicsReady, contractFile, images.length]);

  const chooseImages = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    const available = Math.max(0, 8 - images.length);
    const selected = incoming.slice(0, available).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setImages((current) => [...current, ...selected]);
    if (incoming.length > available) setError("房源图片最多上传 8 张，已保留前 8 张。");
    event.currentTarget.value = "";
  };

  const removeImage = (target: FileItem) => {
    URL.revokeObjectURL(target.url);
    setImages((current) => current.filter((item) => item.url !== target.url));
  };

  const choosePaymentFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files || []).map((file) => file.name);
    setPaymentFiles((current) => Array.from(new Set([...current, ...names])).slice(0, 6));
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
    return "";
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);
    if (!verified) return onStartVerification();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          district: form.district.trim(),
          community: form.community.trim(),
          monthlyRentCents: Math.round(rentValue * 100),
          availableFrom: form.date,
          leaseEndsAt: form.expiry,
          description: form.note.trim(),
          contractFileName: contractFile,
          paymentFileNames: paymentFiles,
          imageNames: images.map((image) => image.name),
        }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) return setError(payload.error || "提交审核失败，请稍后重试。");
      setSubmitted(true);
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <section className="zuji-publisher"><div className="zuji-container"><div className="zuji-publish-success"><span>✓</span><small>提交成功</small><h1>房源已进入审核</h1><p>我们会分别核对发布者身份和这套房源的租赁合同，审核结果会显示在房源状态中。</p><div><b>接下来会发生什么？</b><ol><li>核对本套房源合同与地址</li><li>审核通过后进入找房列表</li><li>有租客联系时通过站内消息通知你</li></ol></div><button onClick={onBack}>返回找房 <span>→</span></button></div></div></section>;
  }

  return <section className="zuji-publisher"><div className="zuji-container"><header className="zuji-publisher-head"><div><span>我要转租 · 发布工作台</span><h1>发布一套真实房源</h1><p>先把房子介绍清楚。提交时如果尚未实名，我们再提醒你完成认证。</p></div><button onClick={onBack}>← 返回找房</button></header><div className="zuji-publish-progress"><div><b>01</b><span>填写房源</span><i className={basicsReady ? "done" : ""} /></div><div><b>02</b><span>上传证明</span><i className={contractFile ? "done" : ""} /></div><div><b>03</b><span>添加图片</span><i className={images.length ? "done" : ""} /></div><small>{completedSteps}/3 已准备</small></div><div className="zuji-publisher-layout"><div className="zuji-publish-form"><PublishSection number="01" title="房源基本信息" hint="带 * 的内容会展示给找房用户，请尽量准确填写。"><label>房源标题 <Required /><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="例如：后海地铁站旁安静次卧，采光很好" maxLength={40} /><small className="zuji-field-help">一句话说清位置、房型或最大优点</small></label><div className="zuji-form-row"><label>区域 <Required /><input value={form.district} onChange={(event) => update("district", event.target.value)} placeholder="例如：南山" /></label><label>小区 <Required /><input value={form.community} onChange={(event) => update("community", event.target.value)} placeholder="例如：蔚蓝海岸" /></label></div><div className="zuji-form-row"><label>月租金 <Required /><div className="zuji-input-affix"><span>¥</span><input inputMode="decimal" value={form.rent} onChange={(event) => update("rent", event.target.value)} placeholder="3600" /><em>元/月</em></div></label><label>最早可入住 <Required /><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label></div><label>当前租约到期 <Required /><input type="date" value={form.expiry} min={form.date || undefined} onChange={(event) => update("expiry", event.target.value)} /><small className="zuji-field-help">用于判断可转租时间，不会公开合同原件</small></label><label>补充说明 <span className="zuji-optional">选填</span><textarea value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="可以介绍房间朝向、家具、室友、通勤和看房时间……" rows={5} /></label></PublishSection><PublishSection number="02" title="本套房源的租赁证明" hint="实名认证属于账号；合同属于这套房。每发布一套新房都要重新匹配合同。"><label className={`zuji-proof-upload ${contractFile ? "ready" : ""}`}><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => { setContractFile(event.target.files?.[0]?.name || ""); setError(""); }} /><span>{contractFile ? "✓" : "↑"}</span><p><b>{contractFile || "上传租赁合同 *"}</b><small>支持 PDF、JPG、PNG，仅用于审核本套房源</small></p><em>{contractFile ? "重新选择" : "选择文件"}</em></label><label className="zuji-proof-upload optional"><input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={choosePaymentFiles} /><span>＋</span><p><b>补充租金支付记录</b><small>选填，近 3–6 个月记录可提升可信度</small></p><em>{paymentFiles.length ? `已选 ${paymentFiles.length} 份` : "可选"}</em></label>{paymentFiles.length > 0 && <div className="zuji-file-list">{paymentFiles.map((file) => <span key={file}>{file}<button type="button" onClick={() => setPaymentFiles((current) => current.filter((item) => item !== file))}>×</button></span>)}</div>}</PublishSection><PublishSection number="03" title="房源实拍图片" hint="最多 8 张。建议依次上传卧室、客厅、厨房、卫生间和窗外环境。"><div className="zuji-image-grid"><label className="zuji-image-add"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseImages} /><b>＋</b><span>添加图片</span><small>{images.length}/8</small></label>{images.map((image, index) => <div className="zuji-image-item" key={image.url}><img src={image.url} alt={image.name} />{index === 0 && <b>封面</b>}<button type="button" aria-label={`移除 ${image.name}`} onClick={() => removeImage(image)}>×</button></div>)}</div></PublishSection>{error && <div className="zuji-publish-error"><b>请检查发布信息</b><span>{error}</span></div>}<div className="zuji-publish-actions"><button className="preview" type="button" onClick={() => setPreview(true)} disabled={!form.title.trim()}>预览房源</button><p>{verified ? "✓ 账号身份已认证" : "提交时检查实名认证状态"}</p><button className="submit" disabled={submitting} onClick={submit}>{submitting ? "正在提交…" : "提交审核"} <span>→</span></button></div></div><aside className="zuji-publish-aside"><div className="zuji-check-card"><span>发布检查</span><CheckLine done={basicsReady} title="房源信息" description={basicsReady ? "必填内容已完整" : "还有必填内容未完成"} /><CheckLine done={Boolean(contractFile)} title="本套房源合同" description={contractFile ? "已选择审核材料" : "提交前必须上传"} /><CheckLine done={images.length > 0} title="实拍图片" description={images.length ? `已添加 ${images.length} 张` : "选填，建议至少 3 张"} /><CheckLine done={verified} title="实名认证" description={verified ? "账号已完成，可复用" : "提交时再完成"} /></div><div className="zuji-publish-tip"><b>为什么分开验证？</b><p>实名认证确认“你是谁”；合同确认“你与这套房的关系”。换房后需要上传新合同，但不用重新实名。</p></div></aside></div></div>{preview && <div className="zuji-preview-backdrop" onClick={() => setPreview(false)}><div className="zuji-preview" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setPreview(false)}>×</button><span>租客看到的房源卡片</span><div className="zuji-preview-photo">{images[0] ? <img src={images[0].url} alt="房源封面预览" /> : <p>添加房源图片后会显示在这里</p>}<b>合同待审核</b></div><small>{form.district || "区域"} · {form.community || "小区"}</small><h2>{form.title || "你的房源标题"}</h2><p>{form.date ? `${form.date} 起可入住` : "入住时间待填写"}</p><strong>¥{rentValue ? rentValue.toLocaleString() : "—"}<em>/月</em></strong><button onClick={() => setPreview(false)}>继续编辑</button></div></div>}</section>;
}

function PublishSection({ number, title, hint, children }: { number: string; title: string; hint: string; children: React.ReactNode }) {
  return <section className="zuji-publish-section"><header><span>{number}</span><div><h2>{title}</h2><p>{hint}</p></div></header>{children}</section>;
}

function Required() { return <i className="zuji-required">*</i>; }

function CheckLine({ done, title, description }: { done: boolean; title: string; description: string }) {
  return <div className="zuji-check-line"><span className={done ? "done" : ""}>{done ? "✓" : "·"}</span><p><b>{title}</b><small>{description}</small></p></div>;
}
