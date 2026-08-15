<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const phone = ref("");
const code = ref("");
const agreed = ref(true);
const sending = ref(false);
const returnTo = ref("");

onLoad((options) => {
  const target = typeof options?.return_to === "string" ? decodeURIComponent(options.return_to) : "";
  returnTo.value = target.startsWith("/pages/") ? target : "";
});

function requireAgreement() {
  if (agreed.value) return true;
  uni.showToast({ title: "请先阅读并同意用户协议和隐私政策", icon: "none" });
  return false;
}

function sendCode() {
  if (!phone.value.trim()) {
    uni.showToast({ title: "请先输入手机号", icon: "none" });
    return;
  }
  sending.value = true;
  setTimeout(() => {
    sending.value = false;
    code.value = "123456";
    uni.showToast({ title: "测试验证码已填入", icon: "none" });
  }, 500);
}

function loginByPhone() {
  if (!requireAgreement()) return;
  if (!phone.value.trim()) {
    uni.showToast({ title: "测试模式下输入任意手机号即可", icon: "none" });
    return;
  }
  uni.setStorageSync("zuji-demo-phone", phone.value.trim());
  uni.showToast({ title: "登录成功", icon: "success" });
  setTimeout(() => {
    if (returnTo.value) {
      uni.redirectTo({ url: returnTo.value });
      return;
    }
    const pages = getCurrentPages();
    if (pages.length > 1) uni.navigateBack();
    else uni.switchTab({ url: "/pages/profile/index" });
  }, 450);
}

function loginByWechat() {
  if (!requireAgreement()) return;
  uni.login({
    provider: "weixin",
    success(result) {
      if (!result.code) {
        uni.showToast({ title: "没有获取到微信登录凭证", icon: "none" });
        return;
      }
      uni.showModal({
        title: "微信授权成功",
        content: "已获得临时登录凭证。下一阶段会把它发送到租迹服务端建立账号。",
        showCancel: false,
      });
    },
    fail() {
      uni.showToast({ title: "微信登录调起失败，请稍后重试", icon: "none" });
    },
  });
}

function openRegister() {
  const suffix = returnTo.value ? `?return_to=${encodeURIComponent(returnTo.value)}` : "";
  uni.redirectTo({ url: `/pages/register/index${suffix}` });
}
</script>

<template>
  <view class="page">
    <view class="brand"><text>租</text><view><text>欢迎回到租迹</text><text>ZUJI</text></view></view>
    <text class="title">登录租迹</text>
    <text class="subtitle">登录后收藏房源、联系发布者，也可以继续发布自己的转租信息。</text>

    <view class="demo-tip"><text>DEMO</text><text>输入任意手机号即可登录，验证码可留空</text></view>

    <view class="form">
      <label><text>手机号</text><view class="phone"><text>+86</text><input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" /></view></label>
      <label><text>验证码（测试阶段可不填）</text><view class="code"><input v-model="code" type="number" maxlength="6" placeholder="可直接留空" /><button :loading="sending" @click="sendCode">{{ sending ? "发送中" : "获取测试码" }}</button></view></label>
      <view class="agreement" @click="agreed = !agreed"><text :class="{ checked: agreed }">{{ agreed ? "✓" : "" }}</text><view>我已阅读并同意《用户协议》和《隐私政策》</view></view>
      <button class="login" @click="loginByPhone">手机号登录</button>
      <view class="register-link">还没有账号？<text @click="openRegister">立即注册</text></view>
    </view>

    <view class="other"><text>其他登录方式</text><button @click="loginByWechat">微</button><text>微信登录</text></view>
    <text class="note">浏览房源不需要登录，登录只用于收藏、沟通和发布。</text>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 55rpx 42rpx calc(46rpx + env(safe-area-inset-bottom)); background: #fff; }
.brand { display: flex; align-items: center; gap: 20rpx; }
.brand > text { display: grid; place-items: center; width: 78rpx; height: 78rpx; border-radius: 22rpx; background: #181a20; color: #f0b90b; font-size: 38rpx; font-weight: 900; }
.brand view text { display: block; color: #8c6a00; font-size: 21rpx; font-weight: 800; }
.brand view text + text { margin-top: 5rpx; color: #a0a7b1; font-size: 16rpx; letter-spacing: 4rpx; }
.title { display: block; margin-top: 48rpx; font-size: 52rpx; font-weight: 850; letter-spacing: -2rpx; }
.subtitle { display: block; max-width: 610rpx; margin-top: 16rpx; color: #77808c; font-size: 23rpx; line-height: 1.8; }
.demo-tip { display: flex; align-items: center; gap: 14rpx; margin-top: 30rpx; padding: 18rpx 20rpx; border: 1rpx solid #efd46b; border-radius: 14rpx; background: #fff9df; color: #715700; font-size: 20rpx; }
.demo-tip text:first-child { padding: 4rpx 9rpx; border-radius: 7rpx; background: #181a20; color: #f0b90b; font-size: 16rpx; font-weight: 850; }
.form { margin-top: 30rpx; }
label { display: block; margin-bottom: 28rpx; }
label > text { display: block; margin-bottom: 13rpx; font-size: 23rpx; font-weight: 750; }
.phone, .code { display: flex; align-items: center; height: 92rpx; padding: 0 22rpx; border: 1rpx solid #dfe2e6; border-radius: 18rpx; background: #f8f9fa; }
.phone > text { padding-right: 20rpx; border-right: 1rpx solid #d8dce1; font-size: 24rpx; font-weight: 750; }
input { flex: 1; height: 100%; padding-left: 20rpx; font-size: 26rpx; }
.code input { padding-left: 0; }
.code button { flex: none; min-width: 176rpx; margin: 0; padding: 18rpx; border-radius: 13rpx; background: #fff3c4; color: #755a00; font-size: 21rpx; font-weight: 750; }
.agreement { display: flex; align-items: center; gap: 13rpx; margin: 7rpx 0 30rpx; color: #747d89; font-size: 20rpx; }
.agreement > text { display: grid; place-items: center; flex: none; width: 34rpx; height: 34rpx; border: 2rpx solid #aeb4bd; border-radius: 6rpx; }
.agreement > text.checked { border-color: #f0b90b; background: #f0b90b; color: #181a20; font-weight: 900; }
.login { min-height: 94rpx; border-radius: 18rpx; background: #f0b90b; color: #181a20; font-size: 27rpx; font-weight: 850; }
.register-link { margin-top: 23rpx; color: #89919c; font-size: 20rpx; text-align: center; }
.register-link text { margin-left: 8rpx; color: #8a6800; font-weight: 800; }
.other { display: flex; flex-direction: column; align-items: center; margin-top: 54rpx; padding-top: 34rpx; border-top: 1rpx solid #eceef0; color: #9aa1ab; font-size: 19rpx; }
.other button { display: grid; place-items: center; width: 84rpx; height: 84rpx; margin: 24rpx 0 10rpx; padding: 0; border-radius: 50%; background: #07c160; color: #fff; font-size: 32rpx; font-weight: 900; }
.note { display: block; margin-top: 46rpx; color: #a0a7b1; font-size: 18rpx; line-height: 1.7; text-align: center; }
</style>
