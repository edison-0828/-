<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

type Conversation = { listingId: string; title: string; location: string; image: string; lastMessage: string; updatedAt: number };
const conversations = ref<Conversation[]>([]);

onShow(() => {
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  if (!phone) { uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fmessages%2Findex" }); return; }
  const stored = uni.getStorageSync(`zuji-conversations:${phone}`);
  conversations.value = Array.isArray(stored) ? stored : [];
});
function open(item: Conversation) { uni.navigateTo({ url: `/pages/messages/thread?id=${encodeURIComponent(item.listingId)}` }); }
function findHomes() { uni.switchTab({ url: "/pages/discover/index" }); }
</script>

<template>
  <view class="page">
    <view class="head"><text>站内消息</text><text>所有咨询按房源整理在这里。</text></view>
    <view v-if="!conversations.length" class="empty"><text>还没有消息</text><text>进入房源详情，点击“咨询”即可和发布者沟通。</text><button @click="findHomes">去找房</button></view>
    <view v-else class="list"><view v-for="item in conversations" :key="item.listingId" class="card" @click="open(item)"><image :src="item.image" mode="aspectFill" /><view><text>{{ item.title }}</text><text>{{ item.location }}</text><text>{{ item.lastMessage }}</text></view><text>›</text></view></view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.head { padding: 34rpx 30rpx; border-radius: 25rpx; background: #181a20; color: #fff; }
.head text { display: block; font-size: 37rpx; font-weight: 850; }
.head text + text { margin-top: 10rpx; color: #b7bec8; font-size: 20rpx; font-weight: 400; }
.list { margin-top: 20rpx; overflow: hidden; border: 1rpx solid #e2e5e8; border-radius: 21rpx; background: #fff; }
.card { display: grid; grid-template-columns: 105rpx 1fr 22rpx; align-items: center; gap: 17rpx; min-height: 145rpx; margin-left: 20rpx; padding: 20rpx 20rpx 20rpx 0; border-top: 1rpx solid #eceef0; }
.card:first-child { border-top: 0; }
.card image { width: 105rpx; height: 96rpx; border-radius: 14rpx; }
.card view { min-width: 0; }
.card view text { display: block; overflow: hidden; margin-top: 6rpx; color: #929aa5; font-size: 17rpx; text-overflow: ellipsis; white-space: nowrap; }
.card view text:first-child { margin: 0; color: #181a20; font-size: 23rpx; font-weight: 800; }
.card view text:last-child { color: #646d79; font-size: 19rpx; }
.card > text { color: #a1a8b1; font-size: 29rpx; }
.empty { padding: 110rpx 25rpx; text-align: center; }
.empty text { display: block; font-size: 27rpx; font-weight: 800; }
.empty text + text { margin-top: 10rpx; color: #929aa5; font-size: 20rpx; font-weight: 400; }
.empty button { margin-top: 28rpx; padding: 17rpx 37rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
