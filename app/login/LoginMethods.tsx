"use client";

import { useState } from "react";

type LoginMethod = "phone" | "wechat";
type AuthView = "login" | "register";

export default function LoginMethods({ returnTo, demoMode }: { returnTo: string; demoMode: boolean }) {
  const [method, setMethod] = useState<LoginMethod>("phone");
  const [view, setView] = useState<AuthView>("login");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMethod = (next: LoginMethod) => {
    setMethod(next);
    setNotice("");
  };

  const switchView = (next: AuthView) => {
    setView(next);
    setCode("");
    setNotice("");
  };

  const requestCode = () => {
    if (demoMode) {
      setNotice("Demo 模式已跳过短信发送，验证码任意输入即可。");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) return setNotice("请输入正确的 11 位手机号。");
    setNotice("短信服务尚未接入，配置服务商后即可发送验证码。");
  };

  const completeDemoAuth = async (demoPhone = phone) => {
    setSubmitting(true);
    setNotice("");
    try {
      const response = await fetch("/api/demo-auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: view, phone: demoPhone }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) return setNotice(payload.error || "Demo 登录失败，请重试。");
      window.location.href = returnTo;
    } catch {
      setNotice("Demo 登录失败，请确认本地服务仍在运行。");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPhone = async () => {
    if (demoMode) return completeDemoAuth();
    if (!/^1[3-9]\d{9}$/.test(phone)) return setNotice("请输入正确的 11 位手机号。");
    if (!/^\d{6}$/.test(code)) return setNotice("请输入 6 位短信验证码。");
    if (!agreed) return setNotice("请先阅读并同意用户协议与隐私政策。");
    setNotice(`${view === "register" ? "注册" : "登录"}接口尚未接入，当前不会创建登录会话。`);
  };

  return <>
    <div className="zuji-login-card-head">
      <div className="zuji-login-mark">租</div>
      <span>{view === "login" ? "欢迎回到租迹" : "创建租迹账号"}</span>
      <h2>{view === "login" ? "登录租迹" : "注册账号"}</h2>
      <p>{view === "login" ? "登录后继续收藏、联系和发布真实转租房源。" : "首次使用请先注册，完成后会自动登录并返回原页面。"}</p>
    </div>

    {demoMode && <div className="zuji-demo-badge"><b>DEMO</b><span>内容任意填写即可进入；手机号输入 <strong>publisher</strong> 可体验转租者端</span></div>}

    {method === "phone" ? <div className="zuji-phone-login">
      <label className="zuji-login-field"><span>手机号</span><div><b>+86</b><input aria-label="手机号" autoComplete="tel" inputMode="numeric" maxLength={demoMode ? 32 : 11} placeholder={demoMode ? "Demo 模式可任意输入" : "请输入手机号"} value={phone} onChange={(event) => { setPhone(demoMode ? event.target.value : event.target.value.replace(/\D/g, "")); setNotice(""); }} /></div></label>
      <label className="zuji-login-field"><span>验证码</span><div><input aria-label="短信验证码" autoComplete="one-time-code" inputMode="numeric" maxLength={demoMode ? 32 : 6} placeholder={demoMode ? "任意输入或留空" : "请输入 6 位验证码"} value={code} onChange={(event) => { setCode(demoMode ? event.target.value : event.target.value.replace(/\D/g, "")); setNotice(""); }} /><button type="button" onClick={requestCode}>{demoMode ? "跳过验证" : "获取验证码"}</button></div></label>
      <label className="zuji-login-agreement"><input type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); setNotice(""); }} /><span>我已阅读并同意《用户协议》和《隐私政策》</span></label>
      <button className="zuji-login-submit" type="button" disabled={submitting} onClick={submitPhone}><span>{submitting ? "正在进入…" : view === "login" ? "登录" : "注册并登录"}</span><b aria-hidden="true">→</b></button>
      <button className="zuji-auth-view-switch" type="button" onClick={() => switchView(view === "login" ? "register" : "login")}>{view === "login" ? <>还没有账号？<b>立即注册</b></> : <>已有账号？<b>返回登录</b></>}</button>
      <div className="zuji-other-login"><span>其他登录方式</span><button type="button" aria-label="切换到微信登录" onClick={() => switchMethod("wechat")}><i aria-hidden="true">微</i></button><small>微信登录</small></div>
    </div> : <div className="zuji-wechat-login">
      <button className="zuji-back-phone" type="button" onClick={() => switchMethod("phone")}>← 返回手机号{view === "login" ? "登录" : "注册"}</button>
      <div className="zuji-wechat-placeholder" aria-label="微信登录二维码占位区"><div className="zuji-wechat-icon">微</div><strong>微信扫码登录</strong><small>{demoMode ? "Demo 模式可直接点击下方按钮" : "接入微信开放平台后显示二维码"}</small></div>
      <h3>打开微信扫一扫</h3>
      <p>扫码后在微信内确认，即可安全登录租迹。</p>
      {demoMode ? <button className="zuji-wechat-demo-submit" type="button" disabled={submitting} onClick={() => completeDemoAuth("wechat-demo")}>{submitting ? "正在进入…" : "Demo 模式直接登录"}</button> : <button className="zuji-wechat-help" type="button" onClick={() => setNotice("微信登录需要配置开放平台 AppID 与回调地址。")}>二维码无法显示？</button>}
    </div>}

    {notice && <div className="zuji-login-alert" role="status">{notice}</div>}
    <small className="zuji-login-note">登录仅用于识别账号和保存站内操作，不会直接公开你的联系方式。登录后会自动返回刚才浏览的页面。</small>
  </>;
}
