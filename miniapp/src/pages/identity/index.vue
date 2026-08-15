<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const phone = ref("");
const verified = ref(false);
const profileMode = ref(false);
const agreeing = ref(true);

function verificationKey(value: string) {
  return `zuji-real-name:${value}`;
}

onLoad((options) => {
  profileMode.value = options?.mode === "profile";
  phone.value = String(uni.getStorageSync("zuji-demo-phone") || "");
  if (!phone.value) {
    const target = profileMode.value
      ? "%2Fpages%2Fidentity%2Findex%3Fmode%3Dprofile"
      : "%2Fpages%2Fidentity%2Findex";
    uni.redirectTo({ url: `/pages/login/index?return_to=${target}` });
    return;
  }

  verified.value = uni.getStorageSync(verificationKey(phone.value)) === "verified";
  if (verified.value && !profileMode.value) {
    uni.redirectTo({ url: "/pages/publish/verification" });
  }
});

function completeDemoVerification() {
  if (!agreeing.value) {
    uni.showToast({ title: "请先同意实名认证说明", icon: "none" });
    return;
  }
  uni.setStorageSync(verificationKey(phone.value), "verified");
  verified.value = true;
  uni.showToast({ title: "模拟认证成功", icon: "success" });
  setTimeout(() => uni.redirectTo({ url: "/pages/publish/verification" }), 450);
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) uni.navigateBack();
  else uni.switchTab({ url: "/pages/profile/index" });
}
</script>

<template>
  <view class="page">
    <view class="progress"><text class="done">✓ 基础信息</text><text class="active">2</text><text>实名认证</text><text>3</text><text>房源核验</text></view>

    <view v-if="verified" class="verified-card">
      <view class="verified-icon">✓</view>
      <text class="verified-title">实名认证已完成</text>
      <text class="verified-copy">当前账号 {{ phone }} 已完成认证，以后发布其他房源不需要重复操作。</text>
      <button @click="goBack">返回我的</button>
    </view>

    <template v-else>
      <view class="hero">
        <text class="eyebrow">账号认证 · 只需一次</text>
        <text class="title">确认发布者是你本人</text>
        <text class="copy">认证结果跟随账号，不会与某一套房绑定。以后更换房源时，只需要重新提交该房源的合同。</text>
      </view>

      <view class="demo-card">
        <view class="demo-label">DEMO</view>
        <view><text>当前不收集真实身份证件</text><text>正式微信登录和私有存储接入前，使用模拟认证完成流程测试。</text></view>
      </view>

      <view class="requirements">
        <view><text>01</text><view><text>身份证件</text><text>正式版上传清晰、完整的证件照片</text></view><text>正式版接入</text></view>
        <view><text>02</text><view><text>本人照片验证</text><text>用于确认提交人与证件持有人一致</text></view><text>正式版接入</text></view>
      </view>

      <view class="privacy"><text>⌁</text><view><text>身份材料不会展示给找房者</text><text>公开页面只显示“身份已认证”的结果。</text></view></view>
      <view class="agreement" @click="agreeing = !agreeing"><text :class="{ checked: agreeing }">{{ agreeing ? "✓" : "" }}</text><view>我已了解实名认证用途，并同意在正式版按隐私政策提交材料</view></view>
      <button class="continue" :class="{ disabled: !agreeing }" @click="completeDemoVerification">模拟认证通过并继续</button>
      <button class="later" @click="goBack">暂不认证，保留房源草稿</button>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 26rpx 24rpx 60rpx; }
.progress { display: flex; align-items: center; gap: 12rpx; color: #9198a2; font-size: 18rpx; }
.progress .done { color: #6f5700; font-weight: 750; }
.progress .active, .progress text:nth-child(4) { display: grid; place-items: center; width: 33rpx; height: 33rpx; border-radius: 50%; background: #e2e5e8; color: #666e79; font-weight: 850; }
.progress .active { background: #f0b90b; color: #181a20; }
.hero { margin-top: 24rpx; padding: 38rpx 30rpx; border-radius: 27rpx; background: #181a20; color: #fff; }
.hero text { display: block; }
.eyebrow { color: #f0b90b; font-size: 20rpx; font-weight: 800; }
.title { margin-top: 14rpx; font-size: 39rpx; font-weight: 850; }
.copy { margin-top: 14rpx; color: #b7bec8; font-size: 21rpx; line-height: 1.75; }
.demo-card { display: flex; align-items: flex-start; gap: 18rpx; margin-top: 22rpx; padding: 23rpx; border: 1rpx solid #ead16a; border-radius: 18rpx; background: #fff9df; }
.demo-label { flex: none; padding: 6rpx 10rpx; border-radius: 7rpx; background: #181a20; color: #f0b90b; font-size: 16rpx; font-weight: 850; }
.demo-card view text { display: block; color: #5f4c00; font-size: 22rpx; font-weight: 800; }
.demo-card view text + text { margin-top: 7rpx; color: #867633; font-size: 18rpx; font-weight: 400; line-height: 1.6; }
.requirements { overflow: hidden; margin-top: 22rpx; border: 1rpx solid #e2e5e8; border-radius: 22rpx; background: #fff; }
.requirements > view { display: grid; grid-template-columns: 55rpx 1fr auto; align-items: center; gap: 17rpx; min-height: 124rpx; padding: 22rpx 24rpx; border-top: 1rpx solid #eceef0; }
.requirements > view:first-child { border-top: 0; }
.requirements > view > text:first-child { display: grid; place-items: center; width: 55rpx; height: 55rpx; border-radius: 15rpx; background: #fff4c4; color: #745900; font-size: 18rpx; font-weight: 850; }
.requirements view view text { display: block; font-size: 23rpx; font-weight: 800; }
.requirements view view text + text { margin-top: 7rpx; color: #929aa5; font-size: 18rpx; font-weight: 400; line-height: 1.5; }
.requirements > view > text:last-child { color: #9aa1aa; font-size: 17rpx; }
.privacy { display: flex; align-items: center; gap: 18rpx; margin-top: 22rpx; padding: 22rpx; border-radius: 18rpx; background: #edf6ef; color: #355c3c; }
.privacy > text { font-size: 32rpx; }
.privacy view text { display: block; font-size: 21rpx; font-weight: 800; }
.privacy view text + text { margin-top: 6rpx; font-size: 18rpx; font-weight: 400; }
.agreement { display: flex; align-items: flex-start; gap: 13rpx; margin-top: 25rpx; color: #727b87; font-size: 19rpx; line-height: 1.6; }
.agreement > text { display: grid; place-items: center; flex: none; width: 34rpx; height: 34rpx; border: 2rpx solid #aeb4bd; border-radius: 6rpx; }
.agreement > text.checked { border-color: #f0b90b; background: #f0b90b; color: #181a20; font-weight: 900; }
.continue { margin-top: 25rpx; min-height: 92rpx; border-radius: 18rpx; background: #f0b90b; color: #181a20; font-size: 26rpx; font-weight: 850; }
.continue.disabled { background: #dfe2e6; color: #8d95a0; }
.later { margin-top: 12rpx; background: transparent; color: #777f8a; font-size: 21rpx; }
.verified-card { display: flex; flex-direction: column; align-items: center; margin-top: 35rpx; padding: 58rpx 34rpx 38rpx; border: 1rpx solid #dce8df; border-radius: 27rpx; background: #fff; text-align: center; }
.verified-icon { display: grid; place-items: center; width: 108rpx; height: 108rpx; border-radius: 50%; background: #f0b90b; color: #181a20; font-size: 53rpx; font-weight: 900; }
.verified-title { margin-top: 25rpx; font-size: 35rpx; font-weight: 850; }
.verified-copy { max-width: 560rpx; margin-top: 13rpx; color: #7c8590; font-size: 21rpx; line-height: 1.7; }
.verified-card button { width: 100%; min-height: 88rpx; margin-top: 33rpx; border-radius: 17rpx; background: #181a20; color: #f0b90b; font-size: 25rpx; font-weight: 850; }
</style>
