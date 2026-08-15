<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

type PublishedListing = { id: string; publisherPhone: string; title: string; city: string; district: string; community: string; rent: string; availableFrom: string; leaseEndsAt: string; cover: string; contractName: string; paymentCount: number; status: string; createdAt: number };
const listing = ref<PublishedListing | null>(null);
const statusText: Record<string, string> = { pending_review: "审核中", published: "已发布", rejected: "需修改", closed: "已结束" };

onLoad((options) => {
  const phone = String(uni.getStorageSync("zuji-demo-phone") || "");
  const id = typeof options?.id === "string" ? decodeURIComponent(options.id) : "";
  if (!phone) { uni.redirectTo({ url: `/pages/login/index?return_to=${encodeURIComponent(`/pages/profile/published-detail?id=${id}`)}` }); return; }
  const stored = uni.getStorageSync("zuji-demo-listings");
  listing.value = (Array.isArray(stored) ? stored : []).find((item) => item?.id === id && item?.publisherPhone === phone) || null;
});
function back() { uni.navigateBack(); }
</script>

<template>
  <view class="page">
    <view v-if="!listing" class="empty"><text>没有找到这条发布记录</text><button @click="back">返回我的发布</button></view>
    <template v-else>
      <view class="status"><text>{{ statusText[listing.status] || listing.status }}</text><text>{{ listing.status === "pending_review" ? "预计 2 小时内完成审核，审核通过后自动上线。" : "房源当前状态已更新，可在我的发布中随时查看。" }}</text></view>
      <image v-if="listing.cover" class="cover" :src="listing.cover" mode="aspectFill" />
      <view class="summary"><text>{{ listing.title }}</text><text>{{ listing.city }} · {{ listing.district }} · {{ listing.community }}</text><text class="rent">¥{{ listing.rent }}/月</text></view>
      <view class="details"><view><text>可入住时间</text><text>{{ listing.availableFrom }}</text></view><view><text>租约到期</text><text>{{ listing.leaseEndsAt }}</text></view><view><text>租赁合同</text><text>{{ listing.contractName || "已提交" }}</text></view><view><text>租金证明</text><text>{{ listing.paymentCount ? `已提交 ${listing.paymentCount} 份` : "未提交（选填）" }}</text></view></view>
      <view class="timeline"><text>审核进度</text><view class="active"><text>✓</text><view><text>已提交</text><text>房源资料与证明材料已保存</text></view></view><view><text>2</text><view><text>审核中 · 预计 2 小时内</text><text>核对合同、地址、租期和租金</text></view></view><view><text>3</text><view><text>公开展示</text><text>审核通过后自动进入找房列表</text></view></view></view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.status { padding: 32rpx 28rpx; border-radius: 23rpx; background: #fff4c4; color: #6f5700; }
.status text { display: block; font-size: 34rpx; font-weight: 850; }
.status text + text { margin-top: 9rpx; font-size: 19rpx; font-weight: 400; line-height: 1.6; }
.cover { width: 100%; height: 390rpx; margin-top: 20rpx; border-radius: 22rpx; }
.summary { margin-top: 20rpx; padding: 27rpx; border: 1rpx solid #e2e5e8; border-radius: 21rpx; background: #fff; }
.summary text { display: block; font-size: 29rpx; font-weight: 850; }
.summary text + text { margin-top: 10rpx; color: #8d95a0; font-size: 20rpx; font-weight: 400; }
.summary .rent { color: #181a20; font-size: 30rpx; font-weight: 850; }
.details, .timeline { margin-top: 20rpx; padding: 25rpx; border: 1rpx solid #e2e5e8; border-radius: 21rpx; background: #fff; }
.details view { display: flex; justify-content: space-between; gap: 25rpx; padding: 19rpx 0; border-top: 1rpx solid #eceef0; }
.details view:first-child { border-top: 0; }
.details view text { color: #8d95a0; font-size: 20rpx; }
.details view text + text { color: #181a20; font-weight: 700; text-align: right; }
.timeline > text { font-size: 26rpx; font-weight: 850; }
.timeline > view { display: grid; grid-template-columns: 48rpx 1fr; gap: 16rpx; margin-top: 22rpx; }
.timeline > view > text { display: grid; place-items: center; width: 48rpx; height: 48rpx; border-radius: 50%; background: #e7e9ec; color: #747c87; font-size: 18rpx; font-weight: 850; }
.timeline > view.active > text { background: #f0b90b; color: #181a20; }
.timeline view view text { display: block; font-size: 22rpx; font-weight: 800; }
.timeline view view text + text { margin-top: 6rpx; color: #929aa5; font-size: 18rpx; font-weight: 400; }
.empty { padding: 140rpx 20rpx; text-align: center; }
.empty text { display: block; font-size: 26rpx; font-weight: 800; }
.empty button { margin-top: 25rpx; padding: 16rpx 28rpx; border-radius: 13rpx; background: #f0b90b; font-size: 21rpx; }
</style>
