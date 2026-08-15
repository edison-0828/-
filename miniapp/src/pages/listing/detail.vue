<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { fetchListing } from "@/services/api";
import type { ListingView } from "@/types/listing";

const listing = ref<ListingView | null>(null);
const loading = ref(true);
const error = ref("");
const currentImage = ref(0);
const saved = ref(false);
const listingId = ref("");
const favoriteNotice = ref("");
let favoriteNoticeTimer: ReturnType<typeof setTimeout> | undefined;

const locationText = computed(() => listing.value ? `${listing.value.city} · ${listing.value.district} · ${listing.value.community}` : "");

async function load(id: string) {
  try {
    listing.value = await fetchListing(id);
    refreshFavorite();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "房源加载失败";
  } finally {
    loading.value = false;
  }
}

function toggleFavorite() {
  if (!listing.value) return;
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  if (!phone) {
    const target = encodeURIComponent(`/pages/listing/detail?id=${listing.value.id}`);
    uni.navigateTo({ url: `/pages/login/index?return_to=${target}` });
    return;
  }
  const key = `zuji-favorites:${phone}`;
  const stored = uni.getStorageSync(key);
  const favorites = Array.isArray(stored) ? stored : [];
  const index = favorites.findIndex((item) => item?.id === listing.value?.id);
  if (index >= 0) favorites.splice(index, 1);
  else favorites.unshift({
    id: listing.value.id,
    title: listing.value.title,
    city: listing.value.city,
    district: listing.value.district,
    community: listing.value.community,
    price: listing.value.price,
    availableFrom: listing.value.availableFrom,
    image: listing.value.image,
    savedAt: Date.now(),
  });
  uni.setStorageSync(key, favorites);
  saved.value = index < 0;
  favoriteNotice.value = saved.value ? "已收藏" : "已取消收藏";
  if (favoriteNoticeTimer) clearTimeout(favoriteNoticeTimer);
  favoriteNoticeTimer = setTimeout(() => { favoriteNotice.value = ""; }, 1600);
}

function refreshFavorite() {
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  if (!phone || !listing.value) {
    saved.value = false;
    return;
  }
  const stored = uni.getStorageSync(`zuji-favorites:${phone}`);
  saved.value = Array.isArray(stored) && stored.some((item) => item?.id === listing.value?.id);
}

function openProtected(path: string) {
  if (!listing.value) return;
  const target = `${path}?id=${encodeURIComponent(listing.value.id)}`;
  if (!uni.getStorageSync("zuji-demo-phone")) {
    uni.navigateTo({ url: `/pages/login/index?return_to=${encodeURIComponent(target)}` });
    return;
  }
  uni.navigateTo({ url: target });
}

function goBack() {
  uni.navigateBack();
}

onLoad((options) => {
  const id = typeof options?.id === "string" ? decodeURIComponent(options.id) : "";
  listingId.value = id;
  if (!id) {
    error.value = "缺少房源编号";
    loading.value = false;
    return;
  }
  void load(id);
});

onShow(refreshFavorite);
</script>

<template>
  <view class="page">
    <view v-if="favoriteNotice" :class="['favorite-notice', { removed: !saved }]"><text>{{ saved ? "♥" : "♡" }}</text><text>{{ favoriteNotice }}</text></view>
    <view v-if="loading" class="state"><text class="brand">租</text><text>正在加载房源…</text></view>
    <view v-else-if="error || !listing" class="state"><text>{{ error || "房源不存在" }}</text><button @click="goBack">返回找房</button></view>
    <template v-else>
      <swiper class="gallery" :current="currentImage" circular @change="currentImage = $event.detail.current">
        <swiper-item v-for="(image, index) in listing.images" :key="image">
          <image class="gallery-image" :src="image" mode="aspectFill" :show-menu-by-longpress="true" />
          <text class="counter">{{ index + 1 }}/{{ listing.images.length }}</text>
        </swiper-item>
      </swiper>

      <view class="summary">
        <button :class="['favorite', { saved }]" @click="toggleFavorite">{{ saved ? "♥" : "♡" }}</button>
        <view class="summary-head"><text class="location">{{ locationText }}</text></view>
        <text class="title">{{ listing.title }}</text>
        <view class="price-row"><text class="price">¥{{ listing.price.toLocaleString() }}</text><text class="unit">/月</text></view>
        <view class="tags"><text>已核验</text><text>{{ listing.availableFrom }} 起可入住</text><text>租约至 {{ listing.leaseEndsAt || "待确认" }}</text></view>
      </view>

      <view class="facts">
        <view><text>所在区域</text><text>{{ listing.district }}</text></view>
        <view><text>小区</text><text>{{ listing.community }}</text></view>
        <view><text>最早入住</text><text>{{ listing.availableFrom }}</text></view>
        <view><text>租约到期</text><text>{{ listing.leaseEndsAt || "与发布者确认" }}</text></view>
      </view>

      <view class="section">
        <text class="kicker">房源说明</text><text class="heading">关于这套房</text>
        <text class="copy">{{ listing.description || "房源由真实租客发布。联系前可以继续确认室友、家具、通勤和租期等细节。" }}</text>
      </view>

      <view class="section">
        <text class="kicker">平台核验</text><text class="heading">关键信息已完成核验</text>
        <view class="evidence"><text>✓</text><view><text>发布账号已确认</text><text>实名认证信息不会对外展示</text></view></view>
        <view class="evidence"><text>✓</text><view><text>本套房合同已匹配</text><text>用于核对地址、租期与发布信息</text></view></view>
        <view class="evidence"><text>¥</text><view><text>租金证明已提交</text><text>只展示结果，不公开原始材料</text></view></view>
      </view>

      <view class="safety"><text>安全提醒</text><text>看房前不要支付押金、定金或转账，优先在站内沟通。</text></view>

      <view class="actions">
        <button :class="['save', { saved }]" @click="toggleFavorite"><text>{{ saved ? "♥" : "♡" }}</text></button>
        <button class="message" @click="openProtected('/pages/messages/thread')">咨询</button>
        <button class="viewing" @click="openProtected('/pages/viewing/create')">预约看房</button>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding-bottom: 150rpx; }
.gallery { height: 590rpx; background: #e5e7ea; }
.gallery-image { width: 100%; height: 100%; }
.counter { position: absolute; right: 24rpx; bottom: 22rpx; padding: 10rpx 18rpx; border-radius: 24rpx; background: rgba(24, 26, 32, .75); color: #fff; font-size: 20rpx; }
.summary { position: relative; margin: -1rpx 20rpx 0; padding: 30rpx; border-radius: 0 0 26rpx 26rpx; background: #fff; box-shadow: 0 14rpx 38rpx rgba(24, 26, 32, .05); }
.summary-head { display: flex; align-items: center; justify-content: space-between; }
.location { color: #8a929d; font-size: 22rpx; }
.favorite { position: absolute; top: 20rpx; right: 24rpx; display: grid; place-items: center; width: 72rpx; height: 72rpx; padding: 0; border: 1rpx solid #dfe2e6; border-radius: 50%; background: #fff; color: #181a20; font-size: 42rpx; line-height: 1; }
.favorite.saved { border-color: #f4c6c8; background: #fff; color: #e5484d; }
.favorite-notice { position: fixed; top: 24rpx; left: 50%; z-index: 80; display: flex; align-items: center; gap: 10rpx; padding: 14rpx 23rpx; transform: translateX(-50%); border: 1rpx solid #f3c9cb; border-radius: 28rpx; background: #fff; color: #e5484d; box-shadow: 0 10rpx 30rpx rgba(24, 26, 32, .14); font-size: 21rpx; font-weight: 800; }
.favorite-notice text:first-child { font-size: 27rpx; }
.favorite-notice.removed { border-color: #dfe2e6; color: #707985; }
.title { display: block; margin-top: 18rpx; padding-right: 72rpx; font-size: 40rpx; font-weight: 800; line-height: 1.4; }
.price-row { display: flex; align-items: baseline; margin-top: 22rpx; }
.price { font-size: 54rpx; font-weight: 900; letter-spacing: -2rpx; }
.unit { margin-left: 5rpx; color: #8a929d; font-size: 21rpx; }
.tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 20rpx; }
.tags text { padding: 9rpx 13rpx; border-radius: 9rpx; background: #fff5cc; color: #755a00; font-size: 19rpx; }
.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 12rpx; margin: 20rpx; }
.facts view { padding: 24rpx; border: 1rpx solid #e3e6e9; border-radius: 18rpx; background: #fff; }
.facts text { display: block; color: #8a929d; font-size: 20rpx; }
.facts text + text { margin-top: 10rpx; color: #181a20; font-size: 25rpx; font-weight: 700; }
.section { margin: 20rpx; padding: 32rpx 28rpx; border: 1rpx solid #e3e6e9; border-radius: 24rpx; background: #fff; }
.kicker, .heading, .copy { display: block; }
.kicker { color: #997500; font-size: 19rpx; font-weight: 800; letter-spacing: 3rpx; }
.heading { margin-top: 12rpx; font-size: 34rpx; font-weight: 800; }
.copy { margin-top: 20rpx; color: #626b78; font-size: 25rpx; line-height: 1.9; }
.evidence { display: flex; gap: 20rpx; margin-top: 16rpx; padding: 22rpx; border-radius: 16rpx; background: #fff9e5; }
.evidence > text { display: grid; place-items: center; flex: none; width: 54rpx; height: 54rpx; border-radius: 50%; background: #f0b90b; font-size: 22rpx; font-weight: 900; }
.evidence view text { display: block; font-size: 24rpx; font-weight: 700; }
.evidence view text + text { margin-top: 7rpx; color: #7e8793; font-size: 19rpx; font-weight: 400; }
.safety { display: grid; gap: 9rpx; margin: 20rpx; padding: 24rpx; border: 1rpx solid #ead47d; border-radius: 18rpx; background: #fff9e5; color: #695100; }
.safety text { font-size: 22rpx; font-weight: 800; }
.safety text + text { font-size: 20rpx; font-weight: 400; line-height: 1.7; }
.actions { position: fixed; right: 0; bottom: 0; left: 0; z-index: 20; display: grid; grid-template-columns: 100rpx 1fr 1.35fr; gap: 12rpx; padding: 16rpx 22rpx calc(16rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid #e3e6e9; background: rgba(255, 255, 255, .96); }
.actions button { display: grid; place-items: center; min-height: 86rpx; margin: 0; border-radius: 18rpx; font-size: 25rpx; font-weight: 800; }
.actions .save { background: transparent; color: #68717e; font-size: 18rpx; }
.actions .save text:first-child { font-size: 35rpx; }
.actions .save.saved { color: #e5484d; }
.actions .message { border: 2rpx solid #181a20; background: #fff; }
.actions .viewing { background: #f0b90b; }
.state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; color: #68717e; font-size: 27rpx; }
.brand { display: grid; place-items: center; width: 84rpx; height: 84rpx; margin-bottom: 24rpx; border-radius: 24rpx; background: #f0b90b; color: #181a20; font-size: 38rpx; font-weight: 900; }
.state button { margin-top: 28rpx; padding: 18rpx 28rpx; border-radius: 14rpx; background: #f0b90b; font-size: 23rpx; font-weight: 800; }
</style>
