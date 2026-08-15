<script setup lang="ts">
import { nextTick, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchListing } from "@/services/api";
import type { ListingView } from "@/types/listing";

type Message = { id: string; body: string; from: "me" | "publisher"; createdAt: number };
const listing = ref<ListingView | null>(null);
const messages = ref<Message[]>([]);
const input = ref("");
const scrollInto = ref("");
const phone = ref("");

function messageKey(id: string) { return `zuji-messages:${phone.value}:${id}`; }
function saveMessages() { if (listing.value) uni.setStorageSync(messageKey(listing.value.id), messages.value); }
function saveConversation(lastMessage: string) {
  if (!listing.value) return;
  const key = `zuji-conversations:${phone.value}`;
  const stored = uni.getStorageSync(key);
  const conversations = Array.isArray(stored) ? stored.filter((item) => item?.listingId !== listing.value?.id) : [];
  conversations.unshift({ listingId: listing.value.id, title: listing.value.title, location: `${listing.value.district} · ${listing.value.community}`, image: listing.value.image, lastMessage, updatedAt: Date.now() });
  uni.setStorageSync(key, conversations.slice(0, 30));
}
function scrollBottom() { nextTick(() => { scrollInto.value = `message-${messages.value.length - 1}`; }); }

onLoad(async (options) => {
  phone.value = String(uni.getStorageSync("zuji-demo-phone") || "");
  const id = typeof options?.id === "string" ? decodeURIComponent(options.id) : "";
  if (!phone.value) { uni.redirectTo({ url: `/pages/login/index?return_to=${encodeURIComponent(`/pages/messages/thread?id=${id}`)}` }); return; }
  if (!id) return;
  try {
    listing.value = await fetchListing(id);
    const stored = uni.getStorageSync(messageKey(id));
    messages.value = Array.isArray(stored) && stored.length ? stored : [{ id: `welcome-${id}`, body: "你好，这套房目前还在，可以直接问我租期、室友或看房时间。", from: "publisher", createdAt: Date.now() }];
    saveMessages();
    saveConversation(messages.value[messages.value.length - 1].body);
    scrollBottom();
  } catch { uni.showToast({ title: "会话加载失败", icon: "none" }); }
});

function send() {
  const body = input.value.trim();
  if (!body || !listing.value) return;
  messages.value.push({ id: `message-${Date.now()}`, body, from: "me", createdAt: Date.now() });
  input.value = "";
  saveMessages();
  saveConversation(body);
  scrollBottom();
}

function openListing() {
  if (listing.value) uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(listing.value.id)}` });
}
</script>

<template>
  <view class="page">
    <view v-if="listing" class="listing" @click="openListing"><image :src="listing.image" mode="aspectFill" /><view><text>{{ listing.title }}</text><text>{{ listing.district }} · {{ listing.community }}　¥{{ listing.price.toLocaleString() }}/月</text></view><text>›</text></view>
    <scroll-view class="messages" scroll-y :scroll-into-view="scrollInto" :scroll-with-animation="true">
      <view v-for="(message, index) in messages" :id="`message-${index}`" :key="message.id" :class="['message', message.from]"><text>{{ message.body }}</text></view>
    </scroll-view>
    <view class="composer"><input v-model="input" confirm-type="send" maxlength="500" placeholder="输入想咨询的问题" @confirm="send" /><button @click="send">发送</button></view>
  </view>
</template>

<style lang="scss" scoped>
.page { height: 100vh; padding-bottom: calc(112rpx + env(safe-area-inset-bottom)); background: #f5f6f7; }
.listing { display: grid; grid-template-columns: 96rpx 1fr 22rpx; align-items: center; gap: 15rpx; margin: 18rpx; padding: 15rpx; border-radius: 17rpx; background: #fff; }
.listing image { width: 96rpx; height: 78rpx; border-radius: 11rpx; }
.listing view { min-width: 0; }
.listing view text { display: block; overflow: hidden; font-size: 21rpx; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.listing view text + text { margin-top: 7rpx; color: #8d95a0; font-size: 17rpx; font-weight: 400; }
.listing > text { color: #a1a8b1; font-size: 29rpx; }
.messages { height: calc(100vh - 240rpx - env(safe-area-inset-bottom)); padding: 12rpx 22rpx 30rpx; }
.message { display: flex; margin-top: 18rpx; }
.message text { max-width: 72%; padding: 18rpx 21rpx; border-radius: 18rpx; background: #fff; font-size: 22rpx; line-height: 1.6; }
.message.me { justify-content: flex-end; }
.message.me text { border-bottom-right-radius: 5rpx; background: #f0b90b; }
.message.publisher text { border-bottom-left-radius: 5rpx; }
.composer { position: fixed; right: 0; bottom: 0; left: 0; display: grid; grid-template-columns: 1fr 125rpx; gap: 12rpx; padding: 14rpx 20rpx calc(14rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid #e1e4e7; background: #fff; }
.composer input { height: 78rpx; padding: 0 20rpx; border-radius: 16rpx; background: #f4f5f6; font-size: 22rpx; }
.composer button { display: grid; place-items: center; min-height: 78rpx; margin: 0; border-radius: 15rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
</style>
