<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchListing } from "@/services/api";
import type { ListingView } from "@/types/listing";

const listing = ref<ListingView | null>(null);
const date = ref("");
const time = ref("");
const note = ref("");
const today = new Date().toISOString().slice(0, 10);

onLoad(async (options) => {
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  const id = typeof options?.id === "string" ? decodeURIComponent(options.id) : "";
  if (!phone) {
    uni.redirectTo({ url: `/pages/login/index?return_to=${encodeURIComponent(`/pages/viewing/create?id=${id}`)}` });
    return;
  }
  if (!id) return;
  try { listing.value = await fetchListing(id); }
  catch { uni.showToast({ title: "房源加载失败", icon: "none" }); }
});

function submit() {
  if (!listing.value || !date.value || !time.value) {
    uni.showToast({ title: "请选择看房日期和时间", icon: "none" });
    return;
  }
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  const key = `zuji-viewings:${phone}`;
  const stored = uni.getStorageSync(key);
  const records = Array.isArray(stored) ? stored : [];
  records.unshift({ id: `viewing-${Date.now()}`, listingId: listing.value.id, listingTitle: listing.value.title, date: date.value, time: time.value, note: note.value.trim(), status: "pending", createdAt: Date.now() });
  uni.setStorageSync(key, records.slice(0, 30));
  uni.showModal({ title: "预约已提交", content: "发布者确认后，状态会在“我的－看房预约”中更新。", showCancel: false, success() { uni.redirectTo({ url: "/pages/profile/viewings" }); } });
}
</script>

<template>
  <view class="page">
    <view class="hero"><text>预约看房</text><text>选一个方便的时间，发布者确认后再前往看房。</text></view>
    <view v-if="listing" class="listing"><image :src="listing.image" mode="aspectFill" /><view><text>{{ listing.title }}</text><text>{{ listing.city }} · {{ listing.district }} · {{ listing.community }}</text><text>¥{{ listing.price.toLocaleString() }}/月</text></view></view>
    <view class="form">
      <label><text>看房日期</text><picker mode="date" :value="date" :start="today" @change="date = $event.detail.value"><view class="field">{{ date || "请选择日期" }}<text>⌄</text></view></picker></label>
      <label><text>看房时间</text><picker mode="time" :value="time" @change="time = $event.detail.value"><view class="field">{{ time || "请选择时间" }}<text>⌄</text></view></picker></label>
      <label><text>给发布者留言（选填）</text><textarea v-model="note" maxlength="200" placeholder="例如：两个人看房，希望确认是否可以养猫" /></label>
    </view>
    <view class="tip">看房前不要支付押金、定金或转账，优先在站内沟通。</view>
    <button class="submit" @click="submit">提交预约</button>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.hero { padding: 35rpx 30rpx; border-radius: 25rpx; background: #f0b90b; }
.hero text { display: block; font-size: 37rpx; font-weight: 850; }
.hero text + text { margin-top: 10rpx; font-size: 20rpx; font-weight: 400; line-height: 1.65; }
.listing { display: grid; grid-template-columns: 160rpx 1fr; gap: 18rpx; margin-top: 20rpx; padding: 18rpx; border: 1rpx solid #e2e5e8; border-radius: 20rpx; background: #fff; }
.listing image { width: 160rpx; height: 135rpx; border-radius: 14rpx; }
.listing view text { display: block; overflow: hidden; margin-top: 8rpx; color: #8d95a0; font-size: 18rpx; text-overflow: ellipsis; white-space: nowrap; }
.listing view text:first-child { margin: 0; color: #181a20; font-size: 23rpx; font-weight: 800; }
.listing view text:last-child { color: #181a20; font-size: 23rpx; font-weight: 850; }
.form { margin-top: 20rpx; padding: 28rpx; border: 1rpx solid #e2e5e8; border-radius: 22rpx; background: #fff; }
label { display: block; margin-bottom: 26rpx; }
label:last-child { margin-bottom: 0; }
label > text { display: block; margin-bottom: 11rpx; font-size: 22rpx; font-weight: 750; }
.field, textarea { width: 100%; border: 1rpx solid #dfe2e6; border-radius: 16rpx; background: #f8f9fa; font-size: 24rpx; }
.field { display: flex; align-items: center; justify-content: space-between; height: 86rpx; padding: 0 20rpx; color: #6f7782; }
textarea { height: 180rpx; padding: 20rpx; }
.tip { margin-top: 20rpx; padding: 20rpx; border-radius: 15rpx; background: #fff8dd; color: #705800; font-size: 19rpx; line-height: 1.6; }
.submit { margin-top: 22rpx; min-height: 90rpx; border-radius: 17rpx; background: #181a20; color: #f0b90b; font-size: 26rpx; font-weight: 850; }
</style>
