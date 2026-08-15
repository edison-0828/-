<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getConversations, getDemoAccount, saveConversations } from "@/services/demo-storage";
import type { Conversation } from "@/types/demo";

const conversations = ref<Conversation[]>([]);
const sortedConversations = computed(() => [...conversations.value].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));

onShow(() => {
  const phone = getDemoAccount();
  if (!phone) { uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fmessages%2Findex" }); return; }
  conversations.value = getConversations(phone);
});
function open(item: Conversation) {
  item.unread = 0;
  saveConversations(conversations.value);
  uni.navigateTo({ url: `/pages/messages/thread?id=${encodeURIComponent(item.listingId)}` });
}
function findHomes() { uni.switchTab({ url: "/pages/discover/index" }); }
function formatTime(timestamp: number) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
</script>

<template>
  <view class="page">
    <view class="head"><text>站内消息</text><text>按房源整理咨询，重要内容不容易错过。</text></view>
    <view v-if="!conversations.length" class="empty"><text class="empty-icon">聊</text><text>还没有咨询消息</text><text>看到感兴趣的房源，可以先问租期、室友或看房时间。</text><button @click="findHomes">去找房</button></view>
    <view v-else class="list"><view v-for="item in sortedConversations" :key="item.listingId" class="card" @click="open(item)"><view class="image-wrap"><image :src="item.image" mode="aspectFill" /><text v-if="item.unread">{{ item.unread > 9 ? "9+" : item.unread }}</text></view><view class="content"><view class="card-title"><text>{{ item.title }}</text><text>{{ formatTime(item.updatedAt) }}</text></view><text class="location">{{ item.location }}</text><text :class="['preview', { unread: item.unread }]">{{ item.lastMessage || "打开会话继续咨询" }}</text></view><text class="arrow">›</text></view></view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.head { padding: 34rpx 30rpx; border-radius: 25rpx; background: #181a20; color: #fff; }
.head text { display: block; font-size: 37rpx; font-weight: 850; }
.head text + text { margin-top: 10rpx; color: #b7bec8; font-size: 20rpx; font-weight: 400; }
.list { margin-top: 20rpx; overflow: hidden; border: 1rpx solid #e2e5e8; border-radius: 21rpx; background: #fff; }
.card { display: grid; grid-template-columns: 105rpx 1fr 22rpx; align-items: center; gap: 17rpx; min-height: 155rpx; margin-left: 20rpx; padding: 20rpx 20rpx 20rpx 0; border-top: 1rpx solid #eceef0; }
.card:first-child { border-top: 0; }
.image-wrap { position: relative; width: 105rpx; height: 102rpx; }
.image-wrap image { width: 100%; height: 100%; border-radius: 15rpx; }
.image-wrap text { position: absolute; top: -8rpx; right: -8rpx; display: grid; place-items: center; min-width: 32rpx; height: 32rpx; padding: 0 7rpx; border: 3rpx solid #fff; border-radius: 18rpx; background: #e5484d; color: #fff; font-size: 15rpx; font-weight: 850; }
.content { min-width: 0; }
.card-title { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
.card-title text { overflow: hidden; color: #181a20; font-size: 23rpx; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.card-title text + text { flex: none; color: #9aa1aa; font-size: 16rpx; font-weight: 400; }
.location, .preview { display: block; overflow: hidden; margin-top: 7rpx; color: #929aa5; font-size: 17rpx; text-overflow: ellipsis; white-space: nowrap; }
.preview { color: #646d79; font-size: 19rpx; }
.preview.unread { color: #181a20; font-weight: 750; }
.arrow { color: #a1a8b1; font-size: 29rpx; }
.empty { padding: 110rpx 25rpx; text-align: center; }
.empty text { display: block; font-size: 27rpx; font-weight: 800; }
.empty .empty-icon { display: grid; place-items: center; width: 86rpx; height: 86rpx; margin: 0 auto 24rpx; border-radius: 24rpx; background: #fff2bd; color: #735900; font-size: 29rpx; }
.empty text + text { margin-top: 10rpx; color: #929aa5; font-size: 20rpx; font-weight: 400; }
.empty button { margin-top: 28rpx; padding: 17rpx 37rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
