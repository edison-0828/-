<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

type Viewing = { id: string; listingId: string; listingTitle: string; date: string; time: string; note: string; status: string };
const records = ref<Viewing[]>([]);
const statusText: Record<string, string> = { pending: "待确认", confirmed: "已确认", rejected: "已拒绝", rescheduled: "已改期", cancelled: "已取消" };

function load() {
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  if (!phone) { uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fprofile%2Fviewings" }); return; }
  const stored = uni.getStorageSync(`zuji-viewings:${phone}`);
  records.value = Array.isArray(stored) ? stored : [];
}
function save() { const phone = String(uni.getStorageSync("zuji-demo-phone") || ""); uni.setStorageSync(`zuji-viewings:${phone}`, records.value); }
function cancel(item: Viewing) { item.status = "cancelled"; save(); }
function openListing(id: string) { uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(id)}` }); }
function findHomes() { uni.switchTab({ url: "/pages/discover/index" }); }
onShow(load);
</script>

<template>
  <view class="page">
    <view class="head"><text>看房预约</text><text>查看时间和发布者确认状态。</text></view>
    <view v-if="!records.length" class="empty"><text>还没有看房预约</text><text>在房源详情页选择“预约看房”即可提交。</text><button @click="findHomes">去找房</button></view>
    <view v-else class="list"><view v-for="item in records" :key="item.id" class="card"><view class="card-head"><text>我发起的预约</text><text :class="item.status">{{ statusText[item.status] || item.status }}</text></view><text class="title" @click="openListing(item.listingId)">{{ item.listingTitle }}</text><view class="time"><text>{{ item.date }}</text><text>{{ item.time }}</text></view><text v-if="item.note" class="note">留言：{{ item.note }}</text><button v-if="item.status === 'pending'" @click="cancel(item)">取消预约</button></view></view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.head { padding: 34rpx 30rpx; border-radius: 25rpx; background: #181a20; color: #fff; }
.head text { display: block; font-size: 37rpx; font-weight: 850; }
.head text + text { margin-top: 10rpx; color: #b7bec8; font-size: 20rpx; font-weight: 400; }
.list { margin-top: 20rpx; }
.card { margin-top: 16rpx; padding: 24rpx; border: 1rpx solid #e2e5e8; border-radius: 20rpx; background: #fff; }
.card-head { display: flex; align-items: center; justify-content: space-between; color: #8d95a0; font-size: 18rpx; }
.card-head text:last-child { padding: 6rpx 11rpx; border-radius: 11rpx; background: #fff3c4; color: #765b00; font-weight: 750; }
.card-head text.cancelled { background: #eef0f2; color: #808791; }
.title { display: block; margin-top: 18rpx; font-size: 26rpx; font-weight: 850; }
.time { display: flex; gap: 12rpx; margin-top: 15rpx; }
.time text { padding: 9rpx 13rpx; border-radius: 10rpx; background: #f5f6f7; font-size: 20rpx; font-weight: 700; }
.note { display: block; margin-top: 14rpx; color: #747d88; font-size: 19rpx; line-height: 1.6; }
.card button { margin: 20rpx 0 0 auto; padding: 12rpx 19rpx; border: 1rpx solid #dfe2e6; border-radius: 12rpx; background: #fff; color: #6e7681; font-size: 19rpx; line-height: 1.3; }
.empty { padding: 110rpx 25rpx; text-align: center; }
.empty text { display: block; font-size: 27rpx; font-weight: 800; }
.empty text + text { margin-top: 10rpx; color: #929aa5; font-size: 20rpx; font-weight: 400; }
.empty button { margin-top: 28rpx; padding: 17rpx 37rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
