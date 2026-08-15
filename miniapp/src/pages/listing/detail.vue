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
  loading.value = true;
  error.value = "";
  try {
    listing.value = await fetchListing(id);
    refreshFavorite();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "房源加载失败";
  } finally {
    loading.value = false;
  }
}

function retryLoad() {
  if (listingId.value) void load(listingId.value);
}

function goFindHomes() {
  uni.switchTab({ url: "/pages/discover/index" });
}

function previewGallery(index: number) {
  if (!listing.value) return;
  uni.previewImage({ current: listing.value.images[index], urls: listing.value.images });
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
    <view v-if="loading" class="loading-state">
      <view class="skeleton gallery-skeleton" />
      <view class="loading-card"><view class="skeleton line short" /><view class="skeleton line title-line" /><view class="skeleton line price-line" /><view class="skeleton chips"><text /><text /><text /></view></view>
      <text>正在加载房源信息…</text>
    </view>
    <view v-else-if="error || !listing" class="state"><text class="state-icon">!</text><text class="state-title">房源暂时无法打开</text><text class="state-copy">{{ error || "房源可能已下架，请返回重新选择。" }}</text><view><button @click="retryLoad">重新加载</button><button class="secondary" @click="goFindHomes">返回找房</button></view></view>
    <template v-else>
      <swiper class="gallery" :current="currentImage" circular :duration="360" @change="currentImage = $event.detail.current">
        <swiper-item v-for="(image, index) in listing.images" :key="image">
          <image class="gallery-image" :src="image" mode="aspectFill" :show-menu-by-longpress="true" @click="previewGallery(index)" />
        </swiper-item>
      </swiper>
      <view class="gallery-meta"><text>点击查看大图</text><text>{{ currentImage + 1 }} / {{ listing.images.length }}</text></view>

      <view class="summary">
        <button :class="['favorite', { saved }]" @click="toggleFavorite">{{ saved ? "♥" : "♡" }}</button>
        <view class="summary-head"><text class="verified-badge">✓ 已核验</text><text class="location">{{ locationText }}</text></view>
        <view class="price-row"><text class="price">¥{{ listing.price.toLocaleString() }}</text><text class="unit">/月</text></view>
        <text class="title">{{ listing.title }}</text>
        <view class="tags"><text>真实租客发布</text><text>{{ listing.availableFrom }} 起可入住</text><text>租约至 {{ listing.leaseEndsAt || "待确认" }}</text></view>
      </view>

      <view class="facts">
        <view><text>区域</text><text>{{ listing.district }}</text></view>
        <view><text>小区</text><text>{{ listing.community }}</text></view>
        <view><text>租期</text><text>{{ listing.availableFrom }} 起</text></view>
      </view>

      <view class="section">
        <text class="kicker">房源说明</text><text class="heading">关于这套房</text>
        <text class="copy">{{ listing.description || "房源由真实租客发布。联系前可以继续确认室友、家具、通勤和租期等细节。" }}</text>
      </view>

      <view class="section">
        <view class="section-title"><view><text class="kicker">平台核验</text><text class="heading">这套房为什么更可信</text></view><text class="shield">✓</text></view>
        <view class="evidence"><text>人</text><view><text>发布者已完成实名认证</text><text>身份信息由平台留存，不会公开展示</text></view></view>
        <view class="evidence"><text>房</text><view><text>合同与当前房源匹配</text><text>平台已核对地址、租期和发布内容</text></view></view>
        <view class="verification-note">核验仅代表材料一致，签约前仍建议现场看房并确认合同。</view>
      </view>

      <view class="safety"><text>安全提醒</text><text>看房前不要支付押金、定金或转账，优先在站内沟通。</text></view>

      <view class="actions">
        <button :class="['save', { saved }]" @click="toggleFavorite"><text>{{ saved ? "♥" : "♡" }}</text></button>
        <button class="message" @click="openProtected('/pages/messages/thread')">在线咨询</button>
        <button class="viewing" @click="openProtected('/pages/viewing/create')">预约看房</button>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding-bottom: 170rpx; background: #f5f6f7; }
.gallery { height: 520rpx; background: #e5e7ea; }
.gallery-image { width: 100%; height: 100%; }
.gallery-meta { display: flex; align-items: center; justify-content: space-between; height: 60rpx; padding: 0 24rpx; background: #181a20; color: #c7ccd3; font-size: 18rpx; }
.gallery-meta text + text { padding: 7rpx 14rpx; border-radius: 18rpx; background: rgba(255, 255, 255, .12); color: #fff; font-weight: 750; }
.summary { position: relative; margin: 20rpx; padding: 30rpx; border: 1rpx solid #e4e6e9; border-radius: 26rpx; background: #fff; box-shadow: 0 14rpx 38rpx rgba(24, 26, 32, .045); }
.summary-head { display: flex; align-items: center; justify-content: space-between; }
.verified-badge { padding: 8rpx 13rpx; border-radius: 9rpx; background: #181a20; color: #f0b90b; font-size: 18rpx; font-weight: 800; }
.location { overflow: hidden; max-width: 420rpx; padding-right: 72rpx; color: #8a929d; font-size: 20rpx; text-overflow: ellipsis; white-space: nowrap; }
.favorite { position: absolute; top: 20rpx; right: 24rpx; display: grid; place-items: center; width: 72rpx; height: 72rpx; padding: 0; border: 1rpx solid #dfe2e6; border-radius: 50%; background: #fff; color: #181a20; font-size: 42rpx; line-height: 1; }
.favorite.saved { border-color: #f4c6c8; background: #fff; color: #e5484d; }
.favorite-notice { position: fixed; top: 24rpx; left: 50%; z-index: 80; display: flex; align-items: center; gap: 10rpx; padding: 14rpx 23rpx; transform: translateX(-50%); border: 1rpx solid #f3c9cb; border-radius: 28rpx; background: #fff; color: #e5484d; box-shadow: 0 10rpx 30rpx rgba(24, 26, 32, .14); font-size: 21rpx; font-weight: 800; }
.favorite-notice text:first-child { font-size: 27rpx; }
.favorite-notice.removed { border-color: #dfe2e6; color: #707985; }
.title { display: block; margin-top: 14rpx; padding-right: 72rpx; font-size: 35rpx; font-weight: 820; line-height: 1.45; }
.price-row { display: flex; align-items: baseline; margin-top: 24rpx; }
.price { font-size: 54rpx; font-weight: 900; letter-spacing: -2rpx; }
.unit { margin-left: 5rpx; color: #8a929d; font-size: 21rpx; }
.tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 20rpx; }
.tags text { padding: 9rpx 13rpx; border-radius: 9rpx; background: #fff5cc; color: #755a00; font-size: 19rpx; }
.facts { display: grid; grid-template-columns: repeat(3, 1fr); margin: 20rpx; padding: 22rpx 10rpx; border: 1rpx solid #e3e6e9; border-radius: 20rpx; background: #fff; }
.facts view { min-width: 0; padding: 6rpx 16rpx; border-left: 1rpx solid #eceef0; text-align: center; }
.facts view:first-child { border-left: 0; }
.facts text { display: block; color: #8a929d; font-size: 20rpx; }
.facts text + text { overflow: hidden; margin-top: 10rpx; color: #181a20; font-size: 22rpx; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.section { margin: 20rpx; padding: 32rpx 28rpx; border: 1rpx solid #e3e6e9; border-radius: 24rpx; background: #fff; }
.kicker, .heading, .copy { display: block; }
.kicker { color: #997500; font-size: 19rpx; font-weight: 800; letter-spacing: 3rpx; }
.heading { margin-top: 12rpx; font-size: 34rpx; font-weight: 800; }
.copy { margin-top: 20rpx; color: #626b78; font-size: 25rpx; line-height: 1.9; }
.section-title { display: flex; align-items: center; justify-content: space-between; }
.shield { display: grid; place-items: center; width: 62rpx; height: 62rpx; border-radius: 19rpx; background: #f0b90b; font-size: 27rpx; font-weight: 900; }
.evidence { display: flex; gap: 20rpx; margin-top: 16rpx; padding: 22rpx; border-radius: 16rpx; background: #f8f9fa; }
.evidence > text { display: grid; place-items: center; flex: none; width: 54rpx; height: 54rpx; border-radius: 50%; background: #f0b90b; font-size: 22rpx; font-weight: 900; }
.evidence view text { display: block; font-size: 24rpx; font-weight: 700; }
.evidence view text + text { margin-top: 7rpx; color: #7e8793; font-size: 19rpx; font-weight: 400; }
.verification-note { margin-top: 18rpx; color: #929aa5; font-size: 18rpx; line-height: 1.65; }
.safety { display: grid; gap: 9rpx; margin: 20rpx; padding: 24rpx; border: 1rpx solid #ead47d; border-radius: 18rpx; background: #fff9e5; color: #695100; }
.safety text { font-size: 22rpx; font-weight: 800; }
.safety text + text { font-size: 20rpx; font-weight: 400; line-height: 1.7; }
.actions { position: fixed; right: 0; bottom: 0; left: 0; z-index: 20; display: grid; grid-template-columns: 96rpx 1fr 1.25fr; gap: 12rpx; padding: 14rpx 22rpx calc(14rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid rgba(218, 221, 225, .9); background: rgba(255, 255, 255, .96); box-shadow: 0 -12rpx 36rpx rgba(24, 26, 32, .07); backdrop-filter: blur(18rpx); }
.actions button { display: grid; place-items: center; min-height: 86rpx; margin: 0; border-radius: 18rpx; font-size: 25rpx; font-weight: 800; }
.actions .save { background: transparent; color: #68717e; font-size: 18rpx; }
.actions .save text:first-child { font-size: 35rpx; }
.actions .save.saved { color: #e5484d; }
.actions .message { border: 2rpx solid #181a20; background: #fff; }
.actions .viewing { background: #f0b90b; }
.loading-state { min-height: 100vh; background: #f5f6f7; }
.loading-state > text { display: block; margin-top: 34rpx; color: #8a929d; font-size: 21rpx; text-align: center; }
.skeleton { overflow: hidden; background: linear-gradient(100deg, #e7e9ec 20%, #f4f5f6 38%, #e7e9ec 56%); background-size: 220% 100%; animation: skeleton-shine 1.35s ease-in-out infinite; }
.gallery-skeleton { height: 520rpx; }
.loading-card { margin: 20rpx; padding: 30rpx; border-radius: 25rpx; background: #fff; }
.line { height: 25rpx; margin-top: 18rpx; border-radius: 10rpx; }
.line.short { width: 45%; margin-top: 0; }
.line.title-line { width: 82%; height: 42rpx; }
.line.price-line { width: 38%; height: 52rpx; }
.chips { display: flex; gap: 12rpx; margin-top: 24rpx; background: transparent; animation: none; }
.chips text { display: block; width: 130rpx; height: 42rpx; border-radius: 10rpx; background: #eceef0; }
@keyframes skeleton-shine { to { background-position-x: -220%; } }
.state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 72vh; padding: 40rpx; text-align: center; }
.state-icon { display: grid; place-items: center; width: 82rpx; height: 82rpx; border-radius: 24rpx; background: #fff2bd; color: #735900; font-size: 39rpx; font-weight: 900; }
.state-title { margin-top: 25rpx; color: #181a20; font-size: 30rpx; font-weight: 850; }
.state-copy { max-width: 540rpx; margin-top: 12rpx; color: #7d8692; font-size: 21rpx; line-height: 1.7; }
.state > view { display: flex; gap: 14rpx; margin-top: 28rpx; }
.state button { margin: 0; padding: 17rpx 27rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
.state button.secondary { border: 1rpx solid #dfe2e6; background: #fff; }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
</style>
