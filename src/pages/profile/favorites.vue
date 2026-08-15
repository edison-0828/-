<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getDemoAccount, getFavorites, saveFavorites } from "@/services/demo-storage";
import type { DemoFavorite } from "@/types/demo";

const favorites = ref<DemoFavorite[]>([]);

function load() {
  const phone = getDemoAccount();
  if (!phone) {
    uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fprofile%2Ffavorites" });
    return;
  }
  favorites.value = getFavorites(phone);
}

function openListing(id: string) { uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(id)}` }); }
function remove(id: string) {
  favorites.value = favorites.value.filter((item) => item.id !== id);
  saveFavorites(favorites.value);
}
function findHomes() { uni.switchTab({ url: "/pages/discover/index" }); }
onShow(load);
</script>

<template>
  <view class="page">
    <view class="head"><text>我的收藏</text><text>看到合适的房源，可以随时回来比较。</text></view>
    <view v-if="!favorites.length" class="empty"><text>♡</text><text>还没有收藏房源</text><text>浏览房源详情时，点击爱心即可保存。</text><button @click="findHomes">去找房</button></view>
    <view v-else class="list">
      <view v-for="item in favorites" :key="item.id" class="card" @click="openListing(item.id)">
        <image :src="item.image" mode="aspectFill" />
        <view><text class="title">{{ item.title }}</text><text>{{ item.city }} · {{ item.district }} · {{ item.community }}</text><text>{{ item.availableFrom }} 可入住</text><text class="rent">¥{{ item.price.toLocaleString() }}/月</text></view>
        <button @click.stop="remove(item.id)">取消</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 26rpx 24rpx 60rpx; }
.head { padding: 34rpx 30rpx; border-radius: 25rpx; background: #181a20; color: #fff; }
.head text { display: block; font-size: 37rpx; font-weight: 850; }
.head text + text { margin-top: 10rpx; color: #b7bec8; font-size: 20rpx; font-weight: 400; }
.list { margin-top: 20rpx; }
.card { position: relative; display: grid; grid-template-columns: 190rpx 1fr; gap: 20rpx; margin-top: 16rpx; padding: 18rpx; border: 1rpx solid #e2e5e8; border-radius: 20rpx; background: #fff; }
.card image { width: 190rpx; height: 164rpx; border-radius: 15rpx; }
.card view { min-width: 0; }
.card view text { display: block; overflow: hidden; margin-top: 7rpx; color: #8d95a0; font-size: 18rpx; text-overflow: ellipsis; white-space: nowrap; }
.card view .title { margin: 0 75rpx 10rpx 0; color: #181a20; font-size: 24rpx; font-weight: 800; }
.card view .rent { margin-top: 12rpx; color: #181a20; font-size: 25rpx; font-weight: 850; }
.card button { position: absolute; top: 16rpx; right: 16rpx; margin: 0; padding: 8rpx 12rpx; background: #f5f6f7; color: #7c8490; font-size: 17rpx; line-height: 1.3; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 110rpx 30rpx; color: #929aa5; text-align: center; }
.empty > text:first-child { color: #c2a126; font-size: 70rpx; }
.empty text:nth-child(2) { margin-top: 18rpx; color: #181a20; font-size: 28rpx; font-weight: 800; }
.empty text:nth-child(3) { margin-top: 10rpx; font-size: 20rpx; }
.empty button { margin-top: 30rpx; padding: 17rpx 38rpx; border-radius: 14rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
