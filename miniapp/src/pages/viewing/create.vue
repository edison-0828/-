<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchListing } from "@/services/api";
import type { ListingView } from "@/types/listing";
import { getDemoAccount, getViewings, saveViewings } from "@/services/demo-storage";
import type { ViewingRecord } from "@/types/demo";

const listing = ref<ListingView | null>(null);
const date = ref("");
const time = ref("");
const note = ref("");
const loading = ref(true);
const error = ref("");
const listingId = ref("");
const submitting = ref(false);
const quickTimes = ["10:00", "14:00", "16:00", "19:00"];
const today = new Date().toISOString().slice(0, 10);
const canSubmit = computed(() => Boolean(listing.value && date.value && time.value && !submitting.value));

async function loadListing(id: string) {
  loading.value = true;
  error.value = "";
  try { listing.value = await fetchListing(id); }
  catch (reason) { error.value = reason instanceof Error ? reason.message : "房源加载失败"; }
  finally { loading.value = false; }
}

onLoad((options) => {
  const phone = getDemoAccount();
  const id = typeof options?.id === "string" ? decodeURIComponent(options.id) : "";
  if (!phone) {
    uni.redirectTo({ url: `/pages/login/index?return_to=${encodeURIComponent(`/pages/viewing/create?id=${id}`)}` });
    return;
  }
  listingId.value = id;
  if (!id) {
    error.value = "缺少房源编号";
    loading.value = false;
    return;
  }
  void loadListing(id);
});

function submit() {
  if (!listing.value || !date.value || !time.value) {
    uni.showToast({ title: "请选择看房日期和时间", icon: "none" });
    return;
  }
  if (new Date(`${date.value}T${time.value}:00`).getTime() <= Date.now()) {
    uni.showToast({ title: "请选择现在之后的看房时间", icon: "none" });
    return;
  }
  submitting.value = true;
  const phone = getDemoAccount();
  const records = getViewings(phone);
  const record: ViewingRecord = { id: `viewing-${Date.now()}`, listingId: listing.value.id, listingTitle: listing.value.title, date: date.value, time: time.value, note: note.value.trim(), status: "pending", createdAt: Date.now() };
  saveViewings([record, ...records].slice(0, 30), phone);
  uni.showModal({ title: "预约已提交", content: `已申请 ${date.value} ${time.value} 看房。发布者确认后，可在“我的－看房预约”查看状态。`, showCancel: false, success() { uni.redirectTo({ url: "/pages/profile/viewings" }); } });
}

function chooseDate(event: { detail: { value: string } }) {
  date.value = event.detail.value;
  if (date.value === today && time.value && new Date(`${date.value}T${time.value}:00`).getTime() <= Date.now()) time.value = "";
}

function retry() {
  if (listingId.value) void loadListing(listingId.value);
}

function findHomes() {
  uni.switchTab({ url: "/pages/discover/index" });
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state"><view class="spinner" /><text>正在准备预约信息…</text></view>
    <view v-else-if="error || !listing" class="state error-state"><text class="error-icon">!</text><text class="state-title">暂时无法预约</text><text>{{ error || "房源可能已下架" }}</text><view><button @click="retry">重新加载</button><button class="secondary" @click="findHomes">返回找房</button></view></view>
    <template v-else>
      <view class="hero"><text class="step">预约看房 · 约 1 分钟</text><text>选择合适的看房时间</text><text>提交后等待发布者确认，无需现在支付任何费用。</text></view>
      <view class="listing"><image :src="listing.image" mode="aspectFill" /><view><text>{{ listing.title }}</text><text>{{ listing.city }} · {{ listing.district }} · {{ listing.community }}</text><text>¥{{ listing.price.toLocaleString() }}/月</text></view></view>
      <view class="form">
        <label><text><b>1</b> 看房日期</text><picker mode="date" :value="date" :start="today" @change="chooseDate"><view :class="['field', { selected: date }]">{{ date || "请选择日期" }}<text>›</text></view></picker></label>
        <label><text><b>2</b> 看房时间</text><view class="quick-times"><button v-for="item in quickTimes" :key="item" :class="{ active: time === item }" @click="time = item">{{ item }}</button></view><picker mode="time" :value="time" @change="time = $event.detail.value"><view :class="['field', 'other-time', { selected: time && !quickTimes.includes(time) }]">{{ time && !quickTimes.includes(time) ? time : "选择其他时间" }}<text>›</text></view></picker></label>
        <label><text><b>3</b> 给发布者留言 <i>选填</i></text><textarea v-model="note" maxlength="200" placeholder="例如：两个人看房，希望确认是否可以养猫" /><text class="count">{{ note.length }}/200</text></label>
      </view>
      <view class="selection"><text>预约时间</text><text>{{ date && time ? `${date} ${time}` : "选择日期和时间后显示" }}</text></view>
      <view class="tip"><text>安全提醒</text><text>看房前不要支付押金、定金或转账，优先在站内沟通。</text></view>
      <button class="submit" :class="{ disabled: !canSubmit }" :disabled="!canSubmit" :loading="submitting" @click="submit">{{ submitting ? "正在提交" : "确认预约" }}</button>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 25rpx 24rpx 60rpx; }
.hero { padding: 34rpx 30rpx; border-radius: 25rpx; background: #181a20; color: #fff; }
.hero text { display: block; font-size: 36rpx; font-weight: 850; }
.hero .step { margin-bottom: 13rpx; color: #f0b90b; font-size: 18rpx; font-weight: 800; letter-spacing: 2rpx; }
.hero text:last-child { margin-top: 11rpx; color: #b8bec7; font-size: 20rpx; font-weight: 400; line-height: 1.65; }
.listing { display: grid; grid-template-columns: 160rpx 1fr; gap: 18rpx; margin-top: 20rpx; padding: 18rpx; border: 1rpx solid #e2e5e8; border-radius: 20rpx; background: #fff; }
.listing image { width: 160rpx; height: 135rpx; border-radius: 14rpx; }
.listing view text { display: block; overflow: hidden; margin-top: 8rpx; color: #8d95a0; font-size: 18rpx; text-overflow: ellipsis; white-space: nowrap; }
.listing view text:first-child { margin: 0; color: #181a20; font-size: 23rpx; font-weight: 800; }
.listing view text:last-child { color: #181a20; font-size: 23rpx; font-weight: 850; }
.form { margin-top: 20rpx; padding: 28rpx; border: 1rpx solid #e2e5e8; border-radius: 22rpx; background: #fff; }
label { display: block; margin-bottom: 26rpx; }
label:last-child { margin-bottom: 0; }
label > text { display: block; margin-bottom: 11rpx; font-size: 22rpx; font-weight: 750; }
label > text b { display: inline-grid; place-items: center; width: 34rpx; height: 34rpx; margin-right: 9rpx; border-radius: 50%; background: #f0b90b; font-size: 18rpx; }
label > text i { margin-left: 8rpx; color: #929aa5; font-size: 18rpx; font-style: normal; font-weight: 400; }
.field, textarea { width: 100%; border: 1rpx solid #dfe2e6; border-radius: 16rpx; background: #f8f9fa; font-size: 24rpx; }
.field { display: flex; align-items: center; justify-content: space-between; height: 86rpx; padding: 0 20rpx; color: #6f7782; }
.field.selected { border-color: #d3ac13; background: #fffaf0; color: #181a20; font-weight: 750; }
.field > text { color: #8b929c; font-size: 32rpx; }
.quick-times { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10rpx; margin-bottom: 12rpx; }
.quick-times button { min-width: 0; margin: 0; padding: 16rpx 4rpx; border: 1rpx solid #e0e3e7; border-radius: 13rpx; background: #f8f9fa; font-size: 20rpx; font-weight: 750; line-height: 1.4; }
.quick-times button.active { border-color: #f0b90b; background: #f0b90b; color: #181a20; }
.other-time { height: 70rpx; font-size: 20rpx; }
textarea { height: 180rpx; padding: 20rpx; }
.count { display: block; margin-top: 8rpx; color: #9aa1aa; font-size: 17rpx; text-align: right; }
.selection { display: flex; align-items: center; justify-content: space-between; margin-top: 20rpx; padding: 22rpx; border-radius: 17rpx; background: #181a20; color: #fff; font-size: 20rpx; }
.selection text + text { color: #f0b90b; font-weight: 800; }
.tip { display: grid; gap: 6rpx; margin-top: 14rpx; padding: 20rpx; border-radius: 15rpx; background: #fff8dd; color: #705800; }
.tip text { font-size: 20rpx; font-weight: 800; }
.tip text + text { font-size: 18rpx; font-weight: 400; line-height: 1.6; }
.submit { margin-top: 22rpx; min-height: 90rpx; border-radius: 17rpx; background: #181a20; color: #f0b90b; font-size: 26rpx; font-weight: 850; }
.submit.disabled { background: #dfe2e6; color: #8c949f; }
.state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; color: #7c8590; font-size: 21rpx; text-align: center; }
.spinner { width: 62rpx; height: 62rpx; margin-bottom: 22rpx; border: 6rpx solid #e1e4e7; border-top-color: #f0b90b; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-icon { display: grid; place-items: center; width: 78rpx; height: 78rpx; margin-bottom: 20rpx; border-radius: 22rpx; background: #fff1bd; color: #735900; font-size: 35rpx; font-weight: 900; }
.state-title { margin-bottom: 8rpx; color: #181a20; font-size: 29rpx; font-weight: 850; }
.error-state > view { display: flex; gap: 12rpx; margin-top: 26rpx; }
.error-state button { margin: 0; padding: 16rpx 24rpx; border-radius: 13rpx; background: #f0b90b; font-size: 20rpx; font-weight: 800; }
.error-state button.secondary { border: 1rpx solid #dfe2e6; background: #fff; }
</style>
