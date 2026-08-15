<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  addPublishedListing,
  clearPublishDraft,
  clearPublishEvidence,
  getDemoAccount,
  getPublishDraft,
  getPublishEvidence,
  isIdentityVerified,
  savePublishEvidence,
} from "@/services/demo-storage";
import type { EvidenceFile, PublishDraft, PublishedListing } from "@/types/demo";

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

const draft = ref<PublishDraft | null>(null);
const contract = ref<EvidenceFile | null>(null);
const payments = ref<EvidenceFile[]>([]);

function readEvidence() {
  const stored = getPublishEvidence();
  contract.value = stored.contract;
  payments.value = stored.payments;
}

function saveEvidence() {
  savePublishEvidence({ contract: contract.value, payments: payments.value, updatedAt: Date.now() });
}

onLoad(() => {
  const phone = getDemoAccount();
  if (!phone) {
    uni.redirectTo({ url: "/pages/login/index?return_to=%2Fpages%2Fidentity%2Findex" });
    return;
  }
  if (!isIdentityVerified(phone)) {
    uni.redirectTo({ url: "/pages/identity/index" });
    return;
  }

  draft.value = getPublishDraft();
  readEvidence();
  if (!draft.value) {
    uni.showModal({
      title: "没有找到房源草稿",
      content: "请返回发布页重新填写基础信息。",
      showCancel: false,
      success() { uni.switchTab({ url: "/pages/publish/index" }); },
    });
  }
});

function savedPath(tempFilePath: string) {
  return new Promise<string>((resolve) => {
    uni.saveFile({
      tempFilePath,
      success(result) { resolve(result.savedFilePath); },
      fail() { resolve(tempFilePath); },
    });
  });
}

function validFile(file: { size?: number }) {
  if ((file.size || 0) > MAX_DOCUMENT_BYTES) {
    uni.showToast({ title: "单份材料不能超过 15MB", icon: "none" });
    return false;
  }
  return true;
}

async function fromImage(file: { path: string; size?: number }, fallbackName: string): Promise<EvidenceFile | null> {
  if (!validFile(file)) return null;
  return { name: fallbackName, path: await savedPath(file.path), size: file.size || 0, format: "image" };
}

async function fromMessageFile(file: { name?: string; path: string; size?: number; type?: string }): Promise<EvidenceFile | null> {
  if (!validFile(file)) return null;
  const name = file.name || "证明材料";
  const isPdf = name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
  const isImage = /\.(jpe?g|png)$/i.test(name) || file.type === "image" || file.type?.startsWith("image/");
  if (!isPdf && !isImage) {
    uni.showToast({ title: "仅支持 PDF、JPG、PNG", icon: "none" });
    return null;
  }
  return { name, path: await savedPath(file.path), size: file.size || 0, format: isPdf ? "pdf" : "image" };
}

function chooseImageFiles(count: number, onReady: (files: EvidenceFile[]) => void, namePrefix: string) {
  uni.chooseImage({
    count,
    sizeType: ["compressed"],
    sourceType: ["camera"],
    async success(result) {
      const rawFiles = Array.isArray(result.tempFiles) ? result.tempFiles : [result.tempFiles];
      const selected = await Promise.all(rawFiles.map((file, index) => fromImage(file as { path: string; size?: number }, `${namePrefix}${index + 1}.jpg`)));
      onReady(selected.filter((file): file is EvidenceFile => Boolean(file)));
    },
  });
}

function chooseMessageFiles(count: number, onReady: (files: EvidenceFile[]) => void) {
  uni.chooseMessageFile({
    count,
    type: "file",
    extension: ["pdf", "jpg", "jpeg", "png"],
    async success(result) {
      const selected = await Promise.all(result.tempFiles.map(fromMessageFile));
      onReady(selected.filter((file): file is EvidenceFile => Boolean(file)));
    },
  });
}

function chooseContract() {
  uni.showActionSheet({
    itemList: ["拍照", "从手机文件选择"],
    success(result) {
      const ready = (files: EvidenceFile[]) => {
        if (!files[0]) return;
        contract.value = files[0];
        saveEvidence();
      };
      if (result.tapIndex === 0) chooseImageFiles(1, ready, "租赁合同");
      else chooseMessageFiles(1, ready);
    },
  });
}

function choosePayments() {
  const remaining = 6 - payments.value.length;
  if (remaining <= 0) {
    uni.showToast({ title: "最多上传 6 份租金证明", icon: "none" });
    return;
  }
  uni.showActionSheet({
    itemList: ["拍照", "从手机文件选择"],
    success(result) {
      const ready = (files: EvidenceFile[]) => {
        payments.value.push(...files.slice(0, remaining));
        saveEvidence();
      };
      if (result.tapIndex === 0) chooseImageFiles(remaining, ready, "租金证明");
      else chooseMessageFiles(remaining, ready);
    },
  });
}

function previewFile(file: EvidenceFile) {
  if (file.format === "image") {
    uni.previewImage({ urls: [file.path], current: file.path });
    return;
  }
  uni.openDocument({ filePath: file.path, showMenu: true });
}

function removeContract() {
  contract.value = null;
  saveEvidence();
}

function removePayment(index: number) {
  payments.value.splice(index, 1);
  saveEvidence();
}

function saveProofs() {
  if (!contract.value) {
    uni.showToast({ title: "请先上传本套房源的租赁合同", icon: "none" });
    return;
  }
  saveEvidence();
  const phone = getDemoAccount();
  const listing: PublishedListing = {
    id: `demo-${Date.now()}`,
    publisherPhone: phone,
    title: draft.value?.title || "",
    city: draft.value?.city || "",
    district: draft.value?.district || "",
    community: draft.value?.community || "",
    rent: draft.value?.rent || "",
    availableFrom: draft.value?.availableFrom || "",
    leaseEndsAt: draft.value?.leaseEndsAt || "",
    description: draft.value?.description || "",
    cover: draft.value?.images[0] || "",
    contractName: contract.value.name,
    paymentCount: payments.value.length,
    status: "pending_review",
    createdAt: Date.now(),
  };
  addPublishedListing(listing);
  clearPublishDraft();
  clearPublishEvidence();
  uni.showModal({
    title: "已提交审核",
    content: "房源和证明材料已进入 Demo 审核队列，通常 2 小时内完成审核并上线。可在“我的发布”查看状态。",
    showCancel: false,
    success() { uni.switchTab({ url: "/pages/profile/index" }); },
  });
}
</script>

<template>
  <view class="page" v-if="draft">
    <view class="steps"><text class="done">✓ 基础信息</text><text>2</text><text>房源核验</text></view>

    <view class="hero">
      <text class="eyebrow">信息已保存</text>
      <text class="title">核验本次发布的房源</text>
      <text class="copy">登录已完成。接下来只核验这套房的合同与租金证明，不会影响你以后发布其他房源。</text>
    </view>

    <view class="summary">
      <image :src="draft.images[0]" mode="aspectFill" />
      <view>
        <text class="summary-title">{{ draft.title }}</text>
        <text>{{ draft.city }} · {{ draft.district }} · {{ draft.community }}</text>
        <text class="rent">¥{{ draft.rent }}/月</text>
      </view>
    </view>

    <view class="proof-card">
      <view class="proof-head"><view><text>本套房源证明</text><text>每次发布都需要重新核验</text></view><text>{{ contract ? "已准备" : "待上传" }}</text></view>

      <view class="upload-block">
        <view class="upload-copy"><view><text>租赁合同 <b>必传</b></text><text>支持 PDF、JPG、PNG，单份不超过 15MB</text></view><button @click="chooseContract">{{ contract ? "重新选择" : "上传合同" }}</button></view>
        <view v-if="contract" class="file-row" @click="previewFile(contract)"><text>{{ contract.format === "pdf" ? "PDF" : "图片" }}</text><view><text>{{ contract.name }}</text><text>点击预览</text></view><button @click.stop="removeContract">删除</button></view>
      </view>

      <view class="upload-block payment-block">
        <view class="upload-copy"><view><text>租金证明 <b>选填</b></text><text>近 3–6 个月支付记录，可提升可信度</text></view><button @click="choosePayments">添加材料</button></view>
        <view v-for="(file, index) in payments" :key="file.path" class="file-row" @click="previewFile(file)"><text>{{ file.format === "pdf" ? "PDF" : "图片" }}</text><view><text>{{ file.name }}</text><text>第 {{ index + 1 }} 份 · 点击预览</text></view><button @click.stop="removePayment(index)">删除</button></view>
        <text class="count">已添加 {{ payments.length }}/6 份</text>
      </view>
    </view>

    <view class="identity-tip"><text>实名认证与房源核验分开</text><text>实名认证属于账号，只需完成一次；这里的资料仅对应当前房源。</text></view>
    <button class="continue" :class="{ disabled: !contract }" @click="saveProofs">提交审核</button>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 26rpx 24rpx 60rpx; }
.steps { display: flex; align-items: center; gap: 13rpx; color: #8b929d; font-size: 20rpx; }
.steps .done { color: #6e5700; font-weight: 750; }
.steps text:nth-child(2) { display: grid; place-items: center; width: 34rpx; height: 34rpx; border-radius: 50%; background: #f0b90b; color: #181a20; font-weight: 850; }
.hero { margin-top: 24rpx; padding: 36rpx 30rpx; border-radius: 27rpx; background: #181a20; color: #fff; }
.hero text { display: block; }
.eyebrow { color: #f0b90b; font-size: 20rpx; font-weight: 800; }
.title { margin-top: 13rpx; font-size: 38rpx; font-weight: 850; }
.copy { margin-top: 14rpx; color: #b6bdc7; font-size: 21rpx; line-height: 1.7; }
.summary { display: grid; grid-template-columns: 164rpx 1fr; gap: 22rpx; margin-top: 22rpx; padding: 22rpx; border: 1rpx solid #e2e5e8; border-radius: 22rpx; background: #fff; }
.summary image { width: 164rpx; height: 142rpx; border-radius: 16rpx; background: #eceef0; }
.summary view text { display: block; color: #8a929d; font-size: 20rpx; }
.summary .summary-title { overflow: hidden; margin-bottom: 11rpx; color: #181a20; font-size: 25rpx; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.summary .rent { margin-top: 14rpx; color: #181a20; font-size: 27rpx; font-weight: 850; }
.proof-card { overflow: hidden; margin-top: 22rpx; border: 1rpx solid #e2e5e8; border-radius: 22rpx; background: #fff; }
.proof-head { display: flex; align-items: center; justify-content: space-between; padding: 25rpx; background: #fff9df; }
.proof-head view text { display: block; font-size: 25rpx; font-weight: 800; }
.proof-head view text + text { margin-top: 7rpx; color: #8c760f; font-size: 19rpx; font-weight: 400; }
.proof-head > text { padding: 7rpx 13rpx; border-radius: 20rpx; background: #f0b90b; font-size: 18rpx; font-weight: 750; }
.upload-block { padding: 25rpx; border-top: 1rpx solid #eceef0; }
.payment-block { background: #fbfbfc; }
.upload-copy { display: flex; align-items: center; justify-content: space-between; gap: 22rpx; }
.upload-copy view { min-width: 0; }
.upload-copy view text { display: block; font-size: 23rpx; font-weight: 800; }
.upload-copy view text b { color: #a66e00; font-size: 17rpx; }
.upload-copy view text + text { margin-top: 8rpx; color: #929aa5; font-size: 18rpx; font-weight: 400; line-height: 1.5; }
.upload-copy button { flex: none; min-width: 142rpx; margin: 0; padding: 15rpx 18rpx; border-radius: 13rpx; background: #f0b90b; color: #181a20; font-size: 19rpx; font-weight: 800; line-height: 1.4; }
.file-row { display: grid; grid-template-columns: 68rpx 1fr auto; align-items: center; gap: 15rpx; margin-top: 18rpx; padding: 16rpx; border: 1rpx solid #e3e6e9; border-radius: 15rpx; background: #fff; }
.file-row > text { display: grid; place-items: center; height: 58rpx; border-radius: 11rpx; background: #fff4c4; color: #735900; font-size: 16rpx; font-weight: 850; }
.file-row view { min-width: 0; }
.file-row view text { display: block; overflow: hidden; font-size: 20rpx; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.file-row view text + text { margin-top: 6rpx; color: #939ba5; font-size: 17rpx; font-weight: 400; }
.file-row button { margin: 0; padding: 12rpx; background: transparent; color: #9b4747; font-size: 18rpx; line-height: 1.3; }
.count { display: block; margin-top: 15rpx; color: #959ca6; font-size: 18rpx; text-align: right; }
.identity-tip { display: grid; gap: 8rpx; margin-top: 22rpx; padding: 23rpx; border-radius: 18rpx; background: #eef6f0; color: #345c3c; }
.identity-tip text { font-size: 21rpx; font-weight: 800; }
.identity-tip text + text { font-size: 19rpx; font-weight: 400; line-height: 1.65; }
.continue { margin-top: 24rpx; min-height: 92rpx; border-radius: 18rpx; background: #f0b90b; color: #181a20; font-size: 27rpx; font-weight: 850; }
.continue.disabled { background: #dfe2e6; color: #8e96a1; }
</style>
