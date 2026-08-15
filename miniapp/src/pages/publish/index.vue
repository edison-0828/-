<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getCityDistricts, PUBLISH_CITIES } from "@/data/cities";
import { locateCity } from "@/services/api";

const PUBLISH_DRAFT_KEY = "zuji-publish-draft";

const title = ref("");
const city = ref("深圳");
const cityIndex = ref(PUBLISH_CITIES.indexOf("深圳"));
const locating = ref(false);
const districts = computed(() => getCityDistricts(city.value));
const districtIndex = ref(0);
const district = ref(getCityDistricts("深圳")[0]);
const community = ref("");
const rent = ref("");
const availableFrom = ref("");
const leaseEndsAt = ref("");
const images = ref<string[]>([]);
const today = new Date().toISOString().slice(0, 10);

function changeCity(event: { detail: { value: string } }) {
  cityIndex.value = Number(event.detail.value);
  city.value = PUBLISH_CITIES[cityIndex.value];
  districtIndex.value = 0;
  district.value = getCityDistricts(city.value)[0];
}

function changeDistrict(event: { detail: { value: string } }) {
  districtIndex.value = Number(event.detail.value);
  district.value = districts.value[districtIndex.value];
}

function detectLocation(showResult = true) {
  if (locating.value) return;
  locating.value = true;
  uni.getLocation({
    type: "gcj02",
    async success(position) {
      try {
        const located = await locateCity(position.latitude, position.longitude);
        if (!located) throw new Error("暂时无法识别所在城市");
        city.value = located;
        const matchedIndex = PUBLISH_CITIES.indexOf(located as typeof PUBLISH_CITIES[number]);
        cityIndex.value = matchedIndex >= 0 ? matchedIndex : PUBLISH_CITIES.indexOf("深圳");
        districtIndex.value = 0;
        district.value = getCityDistricts(city.value)[0];
        if (showResult) uni.showToast({ title: `已定位到${located}`, icon: "none" });
      } catch (reason) {
        if (showResult) uni.showToast({ title: reason instanceof Error ? reason.message : "定位失败", icon: "none" });
      } finally {
        locating.value = false;
      }
    },
    fail() {
      locating.value = false;
      if (showResult) uni.showToast({ title: "定位未开启，请手动选择城市", icon: "none" });
    },
  });
}

function chooseImages() {
  uni.chooseImage({
    count: 8 - images.value.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success(result) { images.value.push(...result.tempFilePaths.slice(0, 8 - images.value.length)); },
  });
}

function removeImage(index: number) { images.value.splice(index, 1); }

function restoreDraft() {
  const draft = uni.getStorageSync(PUBLISH_DRAFT_KEY) as {
    title?: string;
    city?: string;
    district?: string;
    community?: string;
    rent?: string;
    availableFrom?: string;
    leaseEndsAt?: string;
    images?: string[];
  } | undefined;
  if (!draft || typeof draft !== "object" || !draft.title) return false;
  title.value = draft.title;
  community.value = draft.community || "";
  rent.value = draft.rent || "";
  availableFrom.value = draft.availableFrom || "";
  leaseEndsAt.value = draft.leaseEndsAt || "";
  images.value = Array.isArray(draft.images) ? draft.images : [];

  const restoredCityIndex = PUBLISH_CITIES.indexOf(draft.city as typeof PUBLISH_CITIES[number]);
  cityIndex.value = restoredCityIndex >= 0 ? restoredCityIndex : PUBLISH_CITIES.indexOf("深圳");
  city.value = PUBLISH_CITIES[cityIndex.value];
  const restoredDistrictIndex = getCityDistricts(city.value).indexOf(draft.district || "");
  districtIndex.value = restoredDistrictIndex >= 0 ? restoredDistrictIndex : 0;
  district.value = getCityDistricts(city.value)[districtIndex.value];
  return true;
}

function continuePublish() {
  if (!title.value || !city.value || !district.value || !community.value || !rent.value || !availableFrom.value || !leaseEndsAt.value || !images.value.length) {
    uni.showToast({ title: "请填写完整信息、日期并上传图片", icon: "none" });
    return;
  }
  if (leaseEndsAt.value < availableFrom.value) {
    uni.showToast({ title: "租约到期不能早于可入住时间", icon: "none" });
    return;
  }
  uni.setStorageSync(PUBLISH_DRAFT_KEY, {
    title: title.value.trim(),
    city: city.value,
    district: district.value,
    community: community.value.trim(),
    rent: rent.value,
    availableFrom: availableFrom.value,
    leaseEndsAt: leaseEndsAt.value,
    images: [...images.value],
    updatedAt: Date.now(),
  });

  if (!uni.getStorageSync("zuji-demo-phone")) {
    uni.showToast({ title: "房源信息已保存，请先登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/index?return_to=%2Fpages%2Fidentity%2Findex" });
    }, 450);
    return;
  }

  uni.navigateTo({ url: "/pages/identity/index" });
}

onLoad(() => {
  if (!restoreDraft()) detectLocation(false);
});
</script>

<template>
  <view class="page">
    <view class="intro"><text>发布真实转租</text><text>先填写房源，再单独完成实名与本套房合同核验。</text></view>
    <view class="form">
      <label><text>房源标题</text><input v-model="title" placeholder="例如：近地铁次卧，采光很好" maxlength="40" /></label>
      <view class="row">
        <label class="city-field">
          <view class="field-title"><text>城市</text><button :loading="locating" @click="detectLocation()">{{ locating ? "定位中" : "重新定位" }}</button></view>
          <picker :range="PUBLISH_CITIES" :value="cityIndex" @change="changeCity"><view class="select-field"><text>{{ city }}</text><text>⌄</text></view></picker>
        </label>
        <label><text>区域</text><picker :range="districts" :value="districtIndex" @change="changeDistrict"><view class="select-field"><text>{{ district }}</text><text>⌄</text></view></picker></label>
      </view>
      <label><text>小区</text><input v-model="community" placeholder="填写小区名称" /></label>
      <label><text>月租金</text><view class="rent"><text>¥</text><input v-model="rent" type="digit" placeholder="3500" /></view></label>
      <view class="row date-row">
        <label><text>可入住时间</text><picker mode="date" :value="availableFrom" :start="today" @change="availableFrom = $event.detail.value"><view class="select-field"><text :class="{ placeholder: !availableFrom }">{{ availableFrom || "请选择" }}</text><text>⌄</text></view></picker></label>
        <label><text>租约到期时间</text><picker mode="date" :value="leaseEndsAt" :start="availableFrom || today" @change="leaseEndsAt = $event.detail.value"><view class="select-field"><text :class="{ placeholder: !leaseEndsAt }">{{ leaseEndsAt || "请选择" }}</text><text>⌄</text></view></picker></label>
      </view>
      <view class="image-field">
        <view class="label"><text>房源图片</text><text>{{ images.length }}/8</text></view>
        <view class="images">
          <view v-for="(image, index) in images" :key="image" class="image-item"><image :src="image" mode="aspectFill" /><text @click="removeImage(index)">×</text></view>
          <button v-if="images.length < 8" class="add-image" @click="chooseImages"><text>＋</text><text>上传实拍</text></button>
        </view>
      </view>
    </view>
    <view class="tip"><text>为什么分开核验？</text><text>实名认证只需完成一次；合同和租金证明必须对应每一次发布的新房源。</text></view>
    <button class="continue" @click="continuePublish">保存并继续</button>
  </view>
</template>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 24rpx 24rpx 60rpx; }
.intro { padding: 36rpx 30rpx; border-radius: 26rpx; background: #f0b90b; }
.intro text { display: block; font-size: 39rpx; font-weight: 850; }
.intro text + text { margin-top: 13rpx; font-size: 22rpx; font-weight: 500; line-height: 1.7; }
.form { margin-top: 22rpx; padding: 30rpx; border: 1rpx solid #e2e5e8; border-radius: 24rpx; background: #fff; }
label { display: block; margin-bottom: 28rpx; }
label > text, .label text { display: block; margin-bottom: 12rpx; font-size: 23rpx; font-weight: 700; }
input, .rent { height: 88rpx; padding: 0 22rpx; border: 1rpx solid #dfe2e6; border-radius: 16rpx; background: #f8f9fa; font-size: 26rpx; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.field-title { display: flex; align-items: center; justify-content: space-between; min-height: 34rpx; margin-bottom: 12rpx; }
.field-title > text { font-size: 23rpx; font-weight: 700; }
.field-title button { margin: 0; padding: 4rpx 0 4rpx 12rpx; background: transparent; color: #8b6b00; font-size: 18rpx; line-height: 1.4; }
.select-field { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 22rpx; border: 1rpx solid #dfe2e6; border-radius: 16rpx; background: #f8f9fa; font-size: 26rpx; }
.select-field text + text { color: #929aa5; font-size: 22rpx; }
.select-field .placeholder { color: #9ba2ac; }
.date-row .select-field { padding: 0 15rpx; font-size: 21rpx; }
.rent { display: flex; align-items: center; }
.rent > text { margin-right: 12rpx; font-weight: 800; }
.rent input { flex: 1; height: 100%; padding: 0; border: 0; background: transparent; }
.label { display: flex; justify-content: space-between; }
.label text + text { color: #929aa5; font-weight: 400; }
.images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.image-item, .add-image { position: relative; height: 180rpx; overflow: hidden; border-radius: 16rpx; }
.image-item image { width: 100%; height: 100%; }
.image-item > text { position: absolute; top: 8rpx; right: 8rpx; display: grid; place-items: center; width: 38rpx; height: 38rpx; border-radius: 50%; background: #181a20cc; color: #fff; }
.add-image { display: grid; place-items: center; align-content: center; margin: 0; border: 2rpx dashed #d4d8dd; background: #f8f9fa; color: #7d8692; font-size: 21rpx; }
.add-image text:first-child { font-size: 43rpx; }
.tip { display: grid; gap: 9rpx; margin-top: 22rpx; padding: 24rpx; border: 1rpx solid #ead47d; border-radius: 18rpx; background: #fff9e5; color: #695100; }
.tip text { font-size: 22rpx; font-weight: 800; }
.tip text + text { font-size: 20rpx; font-weight: 400; line-height: 1.7; }
.continue { margin-top: 24rpx; min-height: 92rpx; border-radius: 18rpx; background: #181a20; color: #f0b90b; font-size: 27rpx; font-weight: 850; }
</style>
