<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

type PublishedListing = { id: string; publisherPhone: string; title: string; city: string; district: string; community: string; rent: string; availableFrom: string; cover: string; status: string; createdAt: number };
const listings = ref<PublishedListing[]>([]);
const statusText: Record<string, string> = { pending_review: "审核中", published: "已发布", rejected: "需修改", closed: "已结束" };

onShow(() => {
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  if (!phone) { uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fprofile%2Flistings" }); return; }
  const stored = uni.getStorageSync("zuji-demo-listings");
  listings.value = (Array.isArray(stored) ? stored : []).filter((item) => item?.publisherPhone === phone);
});
function open(item: PublishedListing) { uni.navigateTo({ url: `/pages/profile/published-detail?id=${encodeURIComponent(item.id)}` }); }
function publish() { uni.switchTab({ url: "/pages/publish/index" }); }
</script>

<template>
  <view class="page">
    <view class="head"><view><text>我的发布</text><text>查看房源审核与公开状态</text></view><button @click="publish">发布新房源</button></view>
    <view v-if="!listings.length" class="empty"><text>还没有发布房源</text><text>把位置、租金和租期说清楚，就可以提交审核。</text><button @click="publish">去发布</button></view>
    <view v-else class="list"><view v-for="item in listings" :key="item.id" class="card" @click="open(item)"><image v-if="item.cover" :src="item.cover" mode="aspectFill" /><view v-else class="cover">租</view><view class="info"><view><text>{{ item.title }}</text><text :class="item.status">{{ statusText[item.status] || item.status }}</text></view><text>{{ item.city }} · {{ item.district }} · {{ item.community }}</text><text>{{ item.availableFrom }} 可入住</text><text v-if="item.status === 'pending_review'" class="eta">预计 2 小时内完成审核</text><text class="rent">¥{{ item.rent }}/月</text></view><text class="arrow">›</text></view></view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.head { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; padding: 32rpx 28rpx; border-radius: 24rpx; background: #181a20; color: #fff; }
.head view text { display: block; font-size: 35rpx; font-weight: 850; }
.head view text + text { margin-top: 9rpx; color: #b7bec8; font-size: 19rpx; font-weight: 400; }
.head button { flex: none; margin: 0; padding: 15rpx 19rpx; border-radius: 13rpx; background: #f0b90b; font-size: 19rpx; font-weight: 800; line-height: 1.4; }
.list { margin-top: 20rpx; }
.card { position: relative; display: grid; grid-template-columns: 180rpx 1fr 20rpx; align-items: center; gap: 18rpx; margin-top: 15rpx; padding: 17rpx; border: 1rpx solid #e2e5e8; border-radius: 20rpx; background: #fff; }
.card image, .cover { width: 180rpx; height: 158rpx; border-radius: 15rpx; background: #f0b90b; }
.cover { display: grid; place-items: center; font-size: 43rpx; font-weight: 900; }
.info { min-width: 0; }
.info > view { display: flex; align-items: flex-start; justify-content: space-between; gap: 10rpx; }
.info > view text:first-child { overflow: hidden; font-size: 23rpx; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.info > view text:last-child { flex: none; padding: 5rpx 9rpx; border-radius: 9rpx; background: #fff3c4; color: #765b00; font-size: 16rpx; font-weight: 750; }
.info > text { display: block; overflow: hidden; margin-top: 7rpx; color: #929aa5; font-size: 18rpx; text-overflow: ellipsis; white-space: nowrap; }
.info .eta { color: #8a6800; font-size: 17rpx; }
.info .rent { margin-top: 10rpx; color: #181a20; font-size: 24rpx; font-weight: 850; }
.arrow { color: #a1a8b1; font-size: 29rpx; }
.empty { padding: 110rpx 25rpx; text-align: center; }
.empty text { display: block; font-size: 27rpx; font-weight: 800; }
.empty text + text { margin-top: 10rpx; color: #929aa5; font-size: 20rpx; font-weight: 400; }
.empty button { margin-top: 28rpx; padding: 17rpx 37rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
