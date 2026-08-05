"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

export default function IdentityVerificationFlow({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [identityFile, setIdentityFile] = useState("");
  const [faceFile, setFaceFile] = useState("");
  const choose = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => setter(event.target.files?.[0]?.name || "");
  const ready = Boolean(identityFile && faceFile);

  return <div className="zuji-identity-backdrop" onClick={onClose}><section className="zuji-identity-dialog" role="dialog" aria-modal="true" aria-labelledby="identity-title" onClick={(event) => event.stopPropagation()}><button className="close" onClick={onClose} aria-label="关闭实名认证">×</button><header><span>发布前最后一步</span><h2 id="identity-title">确认发布者是你本人</h2><p>实名认证只需完成一次，以后发布其他房源不需要重复认证。每套房的合同仍会单独审核。</p></header><div className="zuji-identity-reason"><b>为什么现在才验证？</b><p>你可以先完整填写并预览房源。只有准备提交时，我们才会要求身份材料。</p></div><div className="zuji-identity-files"><label className={identityFile ? "ready" : ""}><input type="file" accept="image/jpeg,image/png" onChange={choose(setIdentityFile)} /><span>{identityFile ? "✓" : "01"}</span><p><b>{identityFile || "上传身份证件"}</b><small>请上传清晰、完整的证件照片</small></p><em>{identityFile ? "重新选择" : "选择图片"}</em></label><label className={faceFile ? "ready" : ""}><input type="file" accept="image/jpeg,image/png" capture="user" onChange={choose(setFaceFile)} /><span>{faceFile ? "✓" : "02"}</span><p><b>{faceFile || "完成本人照片验证"}</b><small>用于确认提交人与证件持有人一致</small></p><em>{faceFile ? "重新选择" : "开始拍摄"}</em></label></div><div className="zuji-identity-privacy"><span>⌁</span><p><b>材料不会展示在房源中</b><small>租客只能看到“身份已验证”的结果。</small></p></div><button className="submit" disabled={!ready} onClick={onComplete}>完成认证并提交房源 <span>→</span></button><button className="later" onClick={onClose}>暂不提交，返回继续编辑</button></section></div>;
}
