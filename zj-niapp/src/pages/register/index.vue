<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { registerDemoAccount } from "@/services/demo-storage";

const phone = ref("");
const agreed = ref(true);
const returnTo = ref("");

onLoad((options) => {
  const target = typeof options?.return_to === "string" ? decodeURIComponent(options.return_to) : "";
  returnTo.value = target.startsWith("/pages/") ? target : "";
});

function register() {
  if (!phone.value.trim()) { uni.showToast({ title: "请输入手机号", icon: "none" }); return; }
  if (!agreed.value) { uni.showToast({ title: "请先同意用户协议和隐私政策", icon: "none" }); return; }
  registerDemoAccount(phone.value);
  uni.showToast({ title: "注册成功", icon: "success" });
  setTimeout(() => {
    if (returnTo.value) uni.redirectTo({ url: returnTo.value });
    else uni.switchTab({ url: "/pages/profile/index" });
  }, 450);
}

function backLogin() {
  const suffix = returnTo.value ? `?return_to=${encodeURIComponent(returnTo.value)}` : "";
  uni.redirectTo({ url: `/pages/login/index${suffix}` });
}
</script>

<template>
  <view class="page">
    <view class="brand"><text>租</text><view><text>第一次使用租迹</text><text>ZUJI</text></view></view>
    <text class="title">创建账号</text>
    <text class="subtitle">注册后可以收藏房源、预约看房、站内咨询和发布转租。</text>
    <view class="demo"><text>DEMO</text><text>输入任意手机号即可完成注册</text></view>
    <view class="form">
      <label><text>手机号</text><view class="phone"><text>+86</text><input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" /></view></label>
      <view class="agreement" @click="agreed = !agreed"><text :class="{ checked: agreed }">{{ agreed ? "✓" : "" }}</text><view>我已阅读并同意《用户协议》和《隐私政策》</view></view>
      <button class="submit" @click="register">注册并登录</button>
      <view class="login-link">已有账号？<text @click="backLogin">返回登录</text></view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 55rpx 42rpx 60rpx; background: #fff; }
.brand { display: flex; align-items: center; gap: 20rpx; }
.brand > text { display: grid; place-items: center; width: 78rpx; height: 78rpx; border-radius: 22rpx; background: #181a20; color: #f0b90b; font-size: 38rpx; font-weight: 900; }
.brand view text { display: block; color: #8c6a00; font-size: 21rpx; font-weight: 800; }
.brand view text + text { margin-top: 5rpx; color: #a0a7b1; font-size: 16rpx; letter-spacing: 4rpx; }
.title { display: block; margin-top: 48rpx; font-size: 52rpx; font-weight: 850; }
.subtitle { display: block; margin-top: 16rpx; color: #77808c; font-size: 23rpx; line-height: 1.8; }
.demo { display: flex; align-items: center; gap: 14rpx; margin-top: 30rpx; padding: 18rpx 20rpx; border: 1rpx solid #efd46b; border-radius: 14rpx; background: #fff9df; color: #715700; font-size: 20rpx; }
.demo text:first-child { padding: 4rpx 9rpx; border-radius: 7rpx; background: #181a20; color: #f0b90b; font-size: 16rpx; font-weight: 850; }
.form { margin-top: 35rpx; }
label > text { display: block; margin-bottom: 13rpx; font-size: 23rpx; font-weight: 750; }
.phone { display: flex; align-items: center; height: 92rpx; padding: 0 22rpx; border: 1rpx solid #dfe2e6; border-radius: 18rpx; background: #f8f9fa; }
.phone > text { padding-right: 20rpx; border-right: 1rpx solid #d8dce1; font-size: 24rpx; font-weight: 750; }
.phone input { flex: 1; height: 100%; padding-left: 20rpx; font-size: 26rpx; }
.agreement { display: flex; align-items: center; gap: 13rpx; margin: 30rpx 0; color: #747d89; font-size: 20rpx; }
.agreement > text { display: grid; place-items: center; flex: none; width: 34rpx; height: 34rpx; border: 2rpx solid #aeb4bd; border-radius: 6rpx; }
.agreement > text.checked { border-color: #f0b90b; background: #f0b90b; color: #181a20; font-weight: 900; }
.submit { min-height: 94rpx; border-radius: 18rpx; background: #f0b90b; color: #181a20; font-size: 27rpx; font-weight: 850; }
.login-link { margin-top: 24rpx; color: #89919c; font-size: 20rpx; text-align: center; }
.login-link text { margin-left: 8rpx; color: #8a6800; font-weight: 800; }
</style>
