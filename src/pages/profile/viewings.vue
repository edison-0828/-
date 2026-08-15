<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getDemoAccount, getViewings, saveViewings } from "@/services/demo-storage";
import type { ViewingRecord } from "@/types/demo";

const records = ref<ViewingRecord[]>([]);
const statusText: Record<string, string> = { pending: "待确认", confirmed: "已确认", rejected: "已拒绝", rescheduled: "已改期", cancelled: "已取消" };

function load() {
  const phone = getDemoAccount();
  if (!phone) { uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fprofile%2Fviewings" }); return; }
  records.value = getViewings(phone);
}
function save() { saveViewings(records.value); }
function cancel(item: ViewingRecord) {
  uni.showModal({
    title: "取消这次预约？",
    content: `${item.date} ${item.time} 的看房申请将被取消。`,
    confirmText: "确认取消",
    confirmColor: "#9b3e3e",
    success(result) {
      if (!result.confirm) return;
      item.status = "cancelled";
      save();
      uni.showToast({ title: "预约已取消", icon: "none" });
    },
  });
}
function openListing(id: string) { uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(id)}` }); }
function findHomes() { uni.switchTab({ url: "/pages/discover/index" }); }
onShow(load);
</script>

<template>
  <view class="page">
    <view class="head"><text>看房预约</text><text>待发布者确认的申请会保留在这里。</text></view>
    <view v-if="!records.length" class="empty"><text class="empty-icon">◷</text><text>还没有看房预约</text><text>找到合适的房源后，在详情页点击“预约看房”。</text><button @click="findHomes">去找房</button></view>
    <view v-else class="list"><view v-for="item in records" :key="item.id" class="card"><view class="card-head"><text>看房申请</text><text :class="item.status">{{ statusText[item.status] || item.status }}</text></view><view class="title-row" @click="openListing(item.listingId)"><text class="title">{{ item.listingTitle }}</text><text>›</text></view><view class="time"><view><text>日期</text><text>{{ item.date }}</text></view><view><text>时间</text><text>{{ item.time }}</text></view></view><text v-if="item.status === 'pending'" class="status-copy">已通知发布者，确认后状态会自动更新。</text><text v-if="item.note" class="note">留言：{{ item.note }}</text><button v-if="item.status === 'pending'" @click="cancel(item)">取消预约</button></view></view>
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
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 18rpx; margin-top: 18rpx; }
.title-row > text:last-child { color: #939ba5; font-size: 32rpx; }
.title { overflow: hidden; min-width: 0; font-size: 26rpx; font-weight: 850; text-overflow: ellipsis; white-space: nowrap; }
.time { display: grid; grid-template-columns: 1fr 1fr; gap: 12rpx; margin-top: 17rpx; }
.time view { padding: 15rpx; border-radius: 12rpx; background: #f5f6f7; }
.time text { display: block; color: #8b939e; font-size: 17rpx; }
.time text + text { margin-top: 5rpx; color: #181a20; font-size: 21rpx; font-weight: 750; }
.status-copy { display: block; margin-top: 14rpx; color: #7b6412; font-size: 18rpx; }
.note { display: block; margin-top: 14rpx; color: #747d88; font-size: 19rpx; line-height: 1.6; }
.card button { margin: 20rpx 0 0 auto; padding: 12rpx 19rpx; border: 1rpx solid #dfe2e6; border-radius: 12rpx; background: #fff; color: #6e7681; font-size: 19rpx; line-height: 1.3; }
.empty { padding: 100rpx 25rpx; text-align: center; }
.empty text { display: block; font-size: 27rpx; font-weight: 800; }
.empty .empty-icon { display: grid; place-items: center; width: 84rpx; height: 84rpx; margin: 0 auto 24rpx; border-radius: 24rpx; background: #fff2bd; color: #735900; font-size: 37rpx; }
.empty text + text { margin-top: 10rpx; color: #929aa5; font-size: 20rpx; font-weight: 400; }
.empty button { margin-top: 28rpx; padding: 17rpx 37rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
