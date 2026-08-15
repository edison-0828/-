<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh, onShow } from "@dcloudio/uni-app";
import { fetchListings, locateCity } from "@/services/api";
import type { ListingView } from "@/types/listing";
import { useTabPageTransition } from "@/composables/useTabPageTransition";

const advantages = ["全部", "已核验", "近地铁", "预算友好", "近期可住"];
const sorts = ["推荐排序", "租金从低到高", "租金从高到低", "最早可入住"];

const city = ref("深圳");
const keyword = ref("");
const advantage = ref("全部");
const sortIndex = ref(0);
const listings = ref<ListingView[]>([]);
const loading = ref(true);
const error = ref("");
const locating = ref(false);
const phone = ref("");
const verified = ref(false);
const accountMenuOpen = ref(false);
const { pageReady } = useTabPageTransition();
const accountLabel = computed(() => phone.value ? phone.value.slice(-2) || "我" : "登录");

const visibleListings = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  const filtered = listings.value.filter((listing) => {
    const text = `${listing.title}${listing.city}${listing.district}${listing.community}${listing.description || ""}`.toLowerCase();
    if (query && !text.includes(query)) return false;
    if (advantage.value === "已核验" && listing.status !== "published") return false;
    if (advantage.value === "近地铁" && !text.includes("地铁")) return false;
    if (advantage.value === "预算友好" && listing.price >= 4000) return false;
    if (advantage.value === "近期可住") {
      const available = Date.parse(`${listing.availableFrom}T00:00:00`);
      if (!Number.isFinite(available) || available > Date.now() + 30 * 86400000) return false;
    }
    return true;
  });
  if (sortIndex.value === 1) return [...filtered].sort((a, b) => a.price - b.price);
  if (sortIndex.value === 2) return [...filtered].sort((a, b) => b.price - a.price);
  if (sortIndex.value === 3) return [...filtered].sort((a, b) => a.availableFrom.localeCompare(b.availableFrom));
  return filtered;
});

async function loadListings(showLoading = true) {
  if (showLoading) loading.value = true;
  error.value = "";
  try {
    listings.value = await fetchListings(city.value);
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "房源加载失败";
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
}

function useLocation() {
  locating.value = true;
  uni.getLocation({
    type: "gcj02",
    async success(position) {
      try {
        const located = await locateCity(position.latitude, position.longitude);
        if (!located) throw new Error("暂时无法识别所在城市");
        if (located !== "深圳") {
          uni.showToast({ title: `已定位到${located}，当前暂时只开放深圳`, icon: "none", duration: 2600 });
          return;
        }
        uni.showToast({ title: "已定位到深圳", icon: "none" });
      } catch (reason) {
        uni.showToast({ title: reason instanceof Error ? reason.message : "定位失败", icon: "none" });
      } finally {
        locating.value = false;
      }
    },
    fail() {
      locating.value = false;
      uni.showToast({ title: "请允许定位，或手动选择城市", icon: "none" });
    },
  });
}

function openListing(id: string) {
  uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(id)}` });
}

function changeSort(event: { detail: { value: string } }) {
  sortIndex.value = Number(event.detail.value);
}

function openAccount() {
  if (!phone.value) {
    uni.switchTab({ url: "/pages/profile/index" });
    return;
  }
  accountMenuOpen.value = !accountMenuOpen.value;
}

function openProfile() {
  accountMenuOpen.value = false;
  uni.switchTab({ url: "/pages/profile/index" });
}

function openIdentity() {
  accountMenuOpen.value = false;
  uni.navigateTo({ url: "/pages/identity/index?mode=profile" });
}

onLoad(() => {
  uni.setStorageSync("zuji-city", "深圳");
  void loadListings();
});
onShow(() => {
  city.value = "深圳";
  uni.setStorageSync("zuji-city", "深圳");
  phone.value = String(uni.getStorageSync("zuji-demo-phone") || "");
  verified.value = Boolean(phone.value && uni.getStorageSync(`zuji-real-name:${phone.value}`) === "verified");
  accountMenuOpen.value = false;
});
onPullDownRefresh(() => loadListings(false));
</script>

<template>
  <view :class="['page', 'tab-page-transition', { 'tab-page-ready': pageReady }]">
    <view class="hero">
      <view class="hero-top">
        <view class="city" @click="useLocation"><text>{{ locating ? "定位中" : city }}</text></view>
        <view class="account-wrap">
          <button :class="['account', { logged: phone }]" @click="openAccount">{{ accountLabel }}</button>
          <view v-if="phone && accountMenuOpen" class="account-menu">
            <view @click="openProfile"><view class="menu-icon">我</view><view><text>个人中心</text><text>{{ phone }}</text></view><text>›</text></view>
            <view @click="openIdentity"><view :class="['menu-icon', { 'identity-verified': verified }]">✓</view><view><text>实名认证</text><text>{{ verified ? "已认证" : "未认证" }}</text></view><text>›</text></view>
          </view>
        </view>
      </view>
      <text class="eyebrow">真实租客转租</text>
      <text class="headline">找到一间，信息清楚的房子</text>
      <view class="search">
        <text class="search-icon">⌕</text>
        <input v-model="keyword" confirm-type="search" placeholder="搜索小区、区域或地铁站" />
        <text v-if="keyword" class="clear" @click="keyword = ''">×</text>
      </view>
    </view>

    <view class="content">
      <scroll-view class="chips" scroll-x :show-scrollbar="false">
        <view class="chip-row">
          <button v-for="item in advantages" :key="item" :class="['chip', { active: advantage === item }]" @click="advantage = item">{{ item }}</button>
        </view>
      </scroll-view>

      <view class="result-head">
        <view><text class="section-kicker">{{ city }}转租房源</text><text class="result-count">{{ visibleListings.length }} 套可选</text></view>
        <picker :range="sorts" :value="sortIndex" @change="changeSort">
          <view class="sort">{{ sorts[sortIndex] }}⌄</view>
        </picker>
      </view>

      <view v-if="loading" class="state"><text class="spinner">租</text><text>正在寻找附近好房…</text></view>
      <view v-else-if="error" class="state error"><text>暂时没加载出来</text><text class="state-copy">{{ error }}</text><button @click="loadListings()">重新加载</button></view>
      <view v-else-if="!visibleListings.length" class="state"><text>没有符合条件的房源</text><text class="state-copy">换个城市或减少筛选条件试试</text></view>

      <view v-else class="list">
        <view v-for="listing in visibleListings" :key="listing.id" class="card" @click="openListing(listing.id)">
          <view class="photo-wrap">
            <image class="photo" :src="listing.image" mode="aspectFill" lazy-load />
            <text class="verified">✓ 本套租约已核验</text>
            <text class="photo-count">{{ listing.images.length }} 图</text>
          </view>
          <view class="card-body">
            <text class="location">{{ listing.city }} · {{ listing.district }} · {{ listing.community }}</text>
            <text class="title">{{ listing.title }}</text>
            <view class="tags"><text>已核验</text><text v-if="`${listing.title}${listing.description}`.includes('地铁')">近地铁</text><text>{{ listing.availableFrom }} 可住</text></view>
            <view class="card-bottom"><view><text class="price">¥{{ listing.price.toLocaleString() }}</text><text class="unit">/月</text></view><text class="more">查看详情 ›</text></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding-bottom: 36rpx; }
.hero { padding: 30rpx 30rpx 38rpx; background: #fff; border-bottom: 1rpx solid #e7e9ec; }
.hero-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 42rpx; }
button { margin: 0; }
.city { display: flex; align-items: center; gap: 8rpx; min-height: 64rpx; padding: 0 22rpx; border-radius: 32rpx; background: #f0b90b; color: #181a20; font-size: 27rpx; font-weight: 800; }
.account-wrap { position: relative; z-index: 40; }
.account { display: grid; place-items: center; min-width: 76rpx; height: 64rpx; padding: 0 20rpx; border: 1rpx solid #dfe2e6; border-radius: 32rpx; background: #fff; color: #181a20; font-size: 21rpx; font-weight: 800; }
.account.logged { min-width: 64rpx; width: 64rpx; padding: 0; border-color: #181a20; background: #181a20; color: #f0b90b; font-size: 19rpx; }
.account-menu { position: absolute; top: 76rpx; right: 0; width: 310rpx; overflow: hidden; border: 1rpx solid #e1e4e7; border-radius: 18rpx; background: #fff; box-shadow: 0 16rpx 45rpx rgba(24, 26, 32, .16); }
.account-menu > view { display: grid; grid-template-columns: 50rpx 1fr 18rpx; align-items: center; gap: 13rpx; min-height: 98rpx; margin-left: 18rpx; padding-right: 18rpx; border-top: 1rpx solid #eceef0; }
.account-menu > view:first-child { border-top: 0; }
.menu-icon { display: grid; place-items: center; width: 50rpx; height: 50rpx; border-radius: 14rpx; background: #f2f3f5; color: #626b77; font-size: 18rpx; font-weight: 850; }
.menu-icon.identity-verified { background: #fff3c4; color: #725800; }
.account-menu view view text { display: block; font-size: 21rpx; font-weight: 800; }
.account-menu view view text + text { overflow: hidden; max-width: 175rpx; margin-top: 5rpx; color: #929aa5; font-size: 16rpx; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }
.account-menu > view > text:last-child { color: #a0a7b0; font-size: 26rpx; }
.eyebrow { display: block; color: #9a7500; font-size: 20rpx; font-weight: 800; letter-spacing: 3rpx; }
.headline { display: block; max-width: 620rpx; margin-top: 15rpx; font-size: 52rpx; font-weight: 800; line-height: 1.24; letter-spacing: -2rpx; }
.search { display: flex; align-items: center; height: 92rpx; margin-top: 34rpx; padding: 0 24rpx; border: 2rpx solid #e2e5e8; border-radius: 20rpx; background: #f7f8f9; }
.search-icon { margin-right: 15rpx; color: #a27b00; font-size: 42rpx; transform: rotate(-15deg); }
.search input { flex: 1; height: 100%; font-size: 27rpx; }
.clear { padding: 12rpx; color: #929aa5; font-size: 36rpx; }
.content { padding: 26rpx 24rpx; }
.chips { width: 100%; white-space: nowrap; }
.chip-row { display: flex; gap: 12rpx; padding-right: 24rpx; }
.chip { flex: none; min-height: 66rpx; padding: 0 25rpx; border: 1rpx solid #dfe2e6; border-radius: 33rpx; background: #fff; color: #626b78; font-size: 23rpx; }
.chip.active { border-color: #f0b90b; background: #f0b90b; color: #181a20; font-weight: 800; }
.result-head { display: flex; align-items: flex-end; justify-content: space-between; margin: 38rpx 6rpx 20rpx; }
.section-kicker, .result-count { display: block; }
.section-kicker { font-size: 30rpx; font-weight: 800; }
.result-count { margin-top: 8rpx; color: #929aa5; font-size: 21rpx; }
.sort { padding: 16rpx 0 16rpx 20rpx; color: #626b78; font-size: 22rpx; }
.list { display: grid; gap: 22rpx; }
.card { overflow: hidden; border: 1rpx solid #e1e4e7; border-radius: 24rpx; background: #fff; box-shadow: 0 12rpx 36rpx rgba(24, 26, 32, .05); }
.photo-wrap { position: relative; height: 370rpx; background: #e7e9ec; }
.photo { width: 100%; height: 100%; }
.verified, .photo-count { position: absolute; bottom: 18rpx; padding: 10rpx 16rpx; border-radius: 10rpx; font-size: 19rpx; }
.verified { left: 18rpx; background: rgba(24, 26, 32, .88); color: #f0b90b; }
.photo-count { right: 18rpx; background: rgba(255, 255, 255, .9); color: #181a20; }
.card-body { padding: 24rpx; }
.location { display: block; color: #8a929d; font-size: 21rpx; }
.title { display: block; margin-top: 10rpx; font-size: 31rpx; font-weight: 750; line-height: 1.45; }
.tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 16rpx; }
.tags text { padding: 8rpx 12rpx; border-radius: 8rpx; background: #fff7d8; color: #765b00; font-size: 19rpx; }
.card-bottom { display: flex; align-items: baseline; justify-content: space-between; margin-top: 22rpx; padding-top: 20rpx; border-top: 1rpx solid #eceef0; }
.price { font-size: 39rpx; font-weight: 850; }
.unit, .more { color: #929aa5; font-size: 20rpx; }
.unit { margin-left: 4rpx; }
.more { color: #8c6b00; }
.state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420rpx; color: #68717e; font-size: 27rpx; text-align: center; }
.spinner { display: grid; place-items: center; width: 82rpx; height: 82rpx; margin-bottom: 22rpx; border-radius: 24rpx; background: #f0b90b; color: #181a20; font-size: 36rpx; font-weight: 900; }
.state-copy { margin-top: 12rpx; color: #929aa5; font-size: 22rpx; }
.state button { margin-top: 26rpx; padding: 18rpx 30rpx; border-radius: 14rpx; background: #f0b90b; font-size: 23rpx; font-weight: 800; }
</style>
