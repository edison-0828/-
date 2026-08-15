<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useTabPageTransition } from "@/composables/useTabPageTransition";
import { clearDemoAccount, getDemoAccount, getPublishedListings, isIdentityVerified } from "@/services/demo-storage";
import type { PublishedListing } from "@/types/demo";

const phone = ref("");
const verified = ref(false);
const { pageReady } = useTabPageTransition();
const listings = ref<PublishedListing[]>([]);

function openLogin() {
  uni.navigateTo({ url: "/pages/login/index" });
}

function logout() {
  clearDemoAccount();
  phone.value = "";
  uni.showToast({ title: "已退出登录", icon: "none" });
}

function openIdentity() {
  if (!phone.value) {
    uni.navigateTo({ url: "/pages/login/index?return_to=%2Fpages%2Fidentity%2Findex%3Fmode%3Dprofile" });
    return;
  }
  uni.navigateTo({ url: "/pages/identity/index?mode=profile" });
}

function openProtected(path: string) {
  if (!phone.value) {
    uni.navigateTo({ url: `/pages/login/index?return_to=${encodeURIComponent(path)}` });
    return;
  }
  uni.navigateTo({ url: path });
}

onShow(() => {
  phone.value = getDemoAccount();
  verified.value = isIdentityVerified(phone.value);
  listings.value = getPublishedListings(phone.value);
});
</script>

<template>
  <view :class="['page', 'tab-page-transition', { 'tab-page-ready': pageReady }]">
    <view class="profile-card">
      <view class="avatar">租</view>
      <text class="title">{{ phone ? "已登录租迹" : "登录租迹" }}</text>
      <text class="copy">{{ phone ? `测试账号：${phone}` : "登录后收藏房源、联系发布者，也可以发布自己的真实转租信息。" }}</text>
      <button v-if="!phone" @click="openLogin">登录 / 注册</button>
      <button v-else class="logout" @click="logout">退出登录</button>
    </view>
    <view class="menu">
      <view @click="openProtected('/pages/profile/favorites')"><text>♡</text><view><text>我的收藏</text><text>查看保存的房源</text></view><text>›</text></view>
      <view @click="openProtected('/pages/profile/listings')"><text>⌂</text><view><text>我的发布</text><text>{{ phone ? `${listings.length} 套 · 查看审核和在架状态` : "登录后查看发布记录" }}</text></view><text>›</text></view>
      <view @click="openProtected('/pages/profile/viewings')"><text>◷</text><view><text>看房预约</text><text>管理待确认的预约</text></view><text>›</text></view>
      <view @click="openProtected('/pages/messages/index')"><text>聊</text><view><text>站内消息</text><text>继续和房源发布者沟通</text></view><text>›</text></view>
      <view @click="openIdentity"><text>✓</text><view><text>实名认证</text><text>{{ verified ? "已认证，无需重复认证" : "只需认证一次" }}</text></view><text>›</text></view>
    </view>
    <text class="version">租迹小程序迁移版 · 0.1.0</text>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 28rpx 24rpx 60rpx; }
.profile-card { display: flex; flex-direction: column; align-items: center; padding: 54rpx 34rpx 38rpx; border-radius: 28rpx; background: #181a20; color: #fff; text-align: center; }
.avatar { display: grid; place-items: center; width: 104rpx; height: 104rpx; border-radius: 30rpx; background: #f0b90b; color: #181a20; font-size: 48rpx; font-weight: 900; }
.title { margin-top: 24rpx; font-size: 39rpx; font-weight: 850; }
.copy { max-width: 570rpx; margin-top: 13rpx; color: #adb4be; font-size: 22rpx; line-height: 1.75; }
.profile-card button { width: 100%; min-height: 88rpx; margin-top: 30rpx; border-radius: 17rpx; background: #f0b90b; color: #181a20; font-size: 26rpx; font-weight: 850; }
.profile-card button.logout { background: #2b2e35; color: #f0b90b; }
.menu { overflow: hidden; margin-top: 24rpx; border: 1rpx solid #e2e5e8; border-radius: 24rpx; background: #fff; }
.menu > view { display: grid; grid-template-columns: 54rpx 1fr 24rpx; align-items: center; gap: 18rpx; min-height: 116rpx; margin-left: 26rpx; padding-right: 25rpx; border-top: 1rpx solid #eceef0; }
.menu > view:first-child { border-top: 0; }
.menu > view > text:first-child { display: grid; place-items: center; width: 54rpx; height: 54rpx; border-radius: 16rpx; background: #fff5cc; color: #765b00; font-size: 28rpx; font-weight: 800; }
.menu view view text { display: block; font-size: 25rpx; font-weight: 700; }
.menu view view text + text { margin-top: 7rpx; color: #929aa5; font-size: 19rpx; font-weight: 400; }
.menu > view > text:last-child { color: #a3aab4; font-size: 32rpx; }
.version { display: block; margin-top: 34rpx; color: #9aa1ab; font-size: 19rpx; text-align: center; }
</style>
