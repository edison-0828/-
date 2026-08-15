<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import { fetchListings } from "@/services/api";
import type { ListingView } from "@/types/listing";

const city = ref("深圳");
const listings = ref<ListingView[]>([]);
const loading = ref(true);

const average = computed(() => listings.value.length ? Math.round(listings.value.reduce((sum, item) => sum + item.price, 0) / listings.value.length) : 0);
const lowest = computed(() => listings.value.length ? Math.min(...listings.value.map((item) => item.price)) : 0);
const districtRows = computed(() => {
  const groups = new Map<string, number[]>();
  listings.value.forEach((item) => groups.set(item.district, [...(groups.get(item.district) || []), item.price]));
  return [...groups].map(([district, prices]) => ({ district, count: prices.length, average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) })).sort((a, b) => b.count - a.count);
});

async function load() {
  loading.value = true;
  try { listings.value = await fetchListings(city.value); }
  catch { uni.showToast({ title: "行情加载失败", icon: "none" }); }
  finally { loading.value = false; uni.stopPullDownRefresh(); }
}

function openListing(id: string) { uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(id)}` }); }

onLoad(load);
onPullDownRefresh(load);
</script>

<template>
  <view class="page">
    <view class="hero">
      <text class="kicker">{{ city }}租房行情</text>
      <text class="headline">先看行情，再决定住哪里</text>
      <text class="copy">根据租迹当前公开房源生成，仅用于找房预算参考。</text>
      <view class="summary">
        <view><text>在架房源</text><text>{{ listings.length }} 套</text></view>
        <view><text>平均月租</text><text>¥{{ average.toLocaleString() }}</text></view>
        <view><text>最低月租</text><text>¥{{ lowest.toLocaleString() }}</text></view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">区域租金参考</text>
      <view v-if="loading" class="loading">正在计算行情…</view>
      <view v-else class="districts">
        <view v-for="row in districtRows" :key="row.district" class="district">
          <view><text>{{ row.district }}</text><text>{{ row.count }} 套房源</text></view>
          <text>¥{{ row.average.toLocaleString() }}<small>/月</small></text>
        </view>
      </view>
    </view>

    <view class="section deals">
      <text class="section-title">最近更新的房源</text>
      <view v-for="listing in listings.slice(0, 5)" :key="listing.id" class="deal" @click="openListing(listing.id)">
        <view><text>{{ listing.community }}</text><text>{{ listing.district }} · {{ listing.availableFrom }} 可住</text></view>
        <text>¥{{ listing.price.toLocaleString() }}</text>
      </view>
      <text class="note">当前为公开房源报价，不代表官方统计或最终成交价格。</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 24rpx 24rpx 50rpx; }
.hero { overflow: hidden; padding: 38rpx 30rpx 30rpx; border-radius: 28rpx; background: #181a20; color: #fff; }
.kicker, .headline, .copy { display: block; }
.kicker { color: #f0b90b; font-size: 20rpx; font-weight: 800; letter-spacing: 3rpx; }
.headline { max-width: 580rpx; margin-top: 18rpx; font-size: 46rpx; font-weight: 800; line-height: 1.28; }
.copy { margin-top: 15rpx; color: #aeb4bd; font-size: 21rpx; line-height: 1.7; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10rpx; margin-top: 32rpx; }
.summary view { padding: 20rpx 14rpx; border: 1rpx solid #ffffff20; border-radius: 16rpx; background: #ffffff0c; }
.summary text { display: block; color: #aeb4bd; font-size: 18rpx; }
.summary text + text { margin-top: 10rpx; color: #fff; font-size: 26rpx; font-weight: 800; }
.section { margin-top: 24rpx; padding: 28rpx; border: 1rpx solid #e2e5e8; border-radius: 24rpx; background: #fff; }
.section-title { display: block; margin-bottom: 20rpx; font-size: 31rpx; font-weight: 800; }
.district, .deal { display: flex; align-items: center; justify-content: space-between; padding: 22rpx 0; border-top: 1rpx solid #eceef0; }
.district view text, .deal view text { display: block; font-size: 25rpx; font-weight: 700; }
.district view text + text, .deal view text + text { margin-top: 7rpx; color: #8a929d; font-size: 19rpx; font-weight: 400; }
.district > text, .deal > text { font-size: 27rpx; font-weight: 800; }
.district small { color: #8a929d; font-size: 18rpx; font-weight: 400; }
.deal > text { color: #8a6a00; }
.note { display: block; margin-top: 22rpx; color: #9aa1ab; font-size: 18rpx; line-height: 1.7; }
.loading { padding: 60rpx 0; color: #8a929d; font-size: 23rpx; text-align: center; }
</style>
