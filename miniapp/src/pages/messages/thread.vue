<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchListing } from "@/services/api";
import type { ListingView } from "@/types/listing";
import { getConversations, getDemoAccount, getMessages, saveConversations, saveMessages as persistMessages } from "@/services/demo-storage";
import type { DemoMessage } from "@/types/demo";

const listing = ref<ListingView | null>(null);
const messages = ref<DemoMessage[]>([]);
const input = ref("");
const scrollInto = ref("");
const phone = ref("");
const listingId = ref("");
const loading = ref(true);
const error = ref("");
const quickQuestions = ["什么时候可以入住？", "现在方便预约看房吗？", "室友和家具情况怎么样？"];
const canSend = computed(() => Boolean(input.value.trim() && listing.value));
const showQuickQuestions = computed(() => !messages.value.some((message) => message.from === "me"));

function saveMessages() {
  if (!listing.value) return false;
  return persistMessages(listing.value.id, messages.value, phone.value);
}
function saveConversation(lastMessage: string) {
  if (!listing.value) return;
  const conversations = getConversations(phone.value).filter((item) => item.listingId !== listing.value?.id);
  conversations.unshift({ listingId: listing.value.id, title: listing.value.title, location: `${listing.value.district} · ${listing.value.community}`, image: listing.value.image, lastMessage, updatedAt: Date.now(), unread: 0 });
  saveConversations(conversations, phone.value);
}
function scrollBottom() { nextTick(() => { scrollInto.value = `message-${messages.value.length - 1}`; }); }

async function loadConversation(id: string) {
  loading.value = true;
  error.value = "";
  try {
    listing.value = await fetchListing(id);
    const stored = getMessages(id, phone.value);
    messages.value = stored.length ? stored : [{ id: `welcome-${id}`, body: "你好，这套房目前还在，可以直接问我租期、室友或看房时间。", from: "publisher", createdAt: Date.now(), status: "sent" }];
    saveMessages();
    saveConversation(messages.value[messages.value.length - 1].body);
    scrollBottom();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "会话加载失败";
  } finally {
    loading.value = false;
  }
}

onLoad((options) => {
  phone.value = getDemoAccount();
  const id = typeof options?.id === "string" ? decodeURIComponent(options.id) : "";
  if (!phone.value) { uni.redirectTo({ url: `/pages/login/index?return_to=${encodeURIComponent(`/pages/messages/thread?id=${id}`)}` }); return; }
  listingId.value = id;
  if (!id) { error.value = "缺少房源编号"; loading.value = false; return; }
  void loadConversation(id);
});

function send() {
  const body = input.value.trim();
  if (!body || !listing.value) return;
  const message: DemoMessage = { id: `message-${Date.now()}`, body, from: "me", createdAt: Date.now(), status: "sending" };
  messages.value.push(message);
  input.value = "";
  scrollBottom();
  setTimeout(() => finishSend(message), 260);
}

function finishSend(message: DemoMessage) {
  message.status = "sent";
  if (saveMessages()) {
    saveConversation(message.body);
  } else {
    message.status = "failed";
  }
  scrollBottom();
}

function retryMessage(message: DemoMessage) {
  message.status = "sending";
  setTimeout(() => finishSend(message), 260);
}

function useQuickQuestion(question: string) {
  input.value = question;
}

function retryLoad() {
  if (listingId.value) void loadConversation(listingId.value);
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function openListing() {
  if (listing.value) uni.navigateTo({ url: `/pages/listing/detail?id=${encodeURIComponent(listing.value.id)}` });
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state"><view class="spinner" /><text>正在打开会话…</text></view>
    <view v-else-if="error || !listing" class="state"><text class="error-icon">!</text><text class="state-title">会话暂时无法打开</text><text>{{ error || "房源可能已下架" }}</text><button @click="retryLoad">重新加载</button></view>
    <template v-else>
      <view class="listing" @click="openListing"><image :src="listing.image" mode="aspectFill" /><view><text>{{ listing.title }}</text><text>{{ listing.district }} · {{ listing.community }}　¥{{ listing.price.toLocaleString() }}/月</text><text>查看房源详情</text></view><text>›</text></view>
      <scroll-view class="messages" scroll-y :scroll-into-view="scrollInto" :scroll-with-animation="true">
        <view class="chat-tip">请勿提前转账，建议看房后再确认合同。</view>
        <view v-for="(message, index) in messages" :id="`message-${index}`" :key="message.id" :class="['message', message.from]"><view><text class="bubble">{{ message.body }}</text><view class="message-meta"><text>{{ formatTime(message.createdAt) }}</text><text v-if="message.from === 'me' && message.status === 'sending'">发送中…</text><text v-if="message.from === 'me' && message.status === 'failed'" class="failed" @click="retryMessage(message)">发送失败，点击重试</text></view></view></view>
        <view v-if="showQuickQuestions" class="quick-questions"><text>你可以这样问</text><button v-for="question in quickQuestions" :key="question" @click="useQuickQuestion(question)">{{ question }}</button></view>
        <view class="scroll-space" />
      </scroll-view>
      <view class="composer"><input v-model="input" confirm-type="send" maxlength="500" cursor-spacing="18" placeholder="输入想咨询的问题" @confirm="send" /><button :class="{ disabled: !canSend }" :disabled="!canSend" @click="send">发送</button></view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page { height: 100vh; padding-bottom: calc(112rpx + env(safe-area-inset-bottom)); background: #f5f6f7; }
.listing { display: grid; grid-template-columns: 96rpx 1fr 22rpx; align-items: center; gap: 15rpx; margin: 16rpx 18rpx 10rpx; padding: 15rpx; border: 1rpx solid #e3e6e9; border-radius: 17rpx; background: #fff; box-shadow: 0 8rpx 24rpx rgba(24, 26, 32, .035); }
.listing image { width: 96rpx; height: 78rpx; border-radius: 11rpx; }
.listing view { min-width: 0; }
.listing view text { display: block; overflow: hidden; font-size: 21rpx; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.listing view text + text { margin-top: 5rpx; color: #8d95a0; font-size: 17rpx; font-weight: 400; }
.listing view text:last-child { color: #826500; font-size: 16rpx; font-weight: 750; }
.listing > text { color: #a1a8b1; font-size: 29rpx; }
.messages { height: calc(100vh - 240rpx - env(safe-area-inset-bottom)); padding: 8rpx 22rpx 30rpx; }
.chat-tip { width: fit-content; margin: 12rpx auto 22rpx; padding: 9rpx 16rpx; border-radius: 20rpx; background: #e9ebee; color: #7b838e; font-size: 16rpx; }
.message { display: flex; margin-top: 18rpx; }
.message > view { max-width: 76%; }
.message .bubble { display: block; padding: 18rpx 21rpx; border-radius: 18rpx; background: #fff; font-size: 22rpx; line-height: 1.6; word-break: break-all; }
.message.me { justify-content: flex-end; }
.message.me .bubble { border-bottom-right-radius: 5rpx; background: #f0b90b; }
.message.publisher .bubble { border-bottom-left-radius: 5rpx; }
.message-meta { display: flex; gap: 9rpx; margin-top: 6rpx; color: #9aa1aa; font-size: 15rpx; }
.message.me .message-meta { justify-content: flex-end; }
.message-meta .failed { color: #bf3f43; }
.quick-questions { display: grid; gap: 10rpx; margin: 28rpx 0 8rpx; }
.quick-questions > text { color: #8b939d; font-size: 17rpx; }
.quick-questions button { width: fit-content; margin: 0; padding: 13rpx 18rpx; border: 1rpx solid #ded27f; border-radius: 20rpx; background: #fffbe9; color: #675100; font-size: 18rpx; line-height: 1.4; }
.scroll-space { height: 30rpx; }
.composer { position: fixed; right: 0; bottom: 0; left: 0; display: grid; grid-template-columns: 1fr 125rpx; gap: 12rpx; padding: 14rpx 20rpx calc(14rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid #e1e4e7; background: #fff; }
.composer input { height: 78rpx; padding: 0 20rpx; border-radius: 16rpx; background: #f4f5f6; font-size: 22rpx; }
.composer button { display: grid; place-items: center; min-height: 78rpx; margin: 0; border-radius: 15rpx; background: #f0b90b; font-size: 22rpx; font-weight: 800; }
.composer button.disabled { background: #dfe2e6; color: #8d95a0; }
.state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 72vh; color: #7d8590; font-size: 21rpx; text-align: center; }
.spinner { width: 60rpx; height: 60rpx; margin-bottom: 22rpx; border: 6rpx solid #e1e4e7; border-top-color: #f0b90b; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-icon { display: grid; place-items: center; width: 78rpx; height: 78rpx; margin-bottom: 20rpx; border-radius: 22rpx; background: #fff1bd; color: #735900; font-size: 35rpx; font-weight: 900; }
.state-title { margin-bottom: 8rpx; color: #181a20; font-size: 29rpx; font-weight: 850; }
.state button { margin-top: 25rpx; padding: 16rpx 26rpx; border-radius: 13rpx; background: #f0b90b; font-size: 20rpx; font-weight: 800; }
</style>
