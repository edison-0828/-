<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => {
  console.info("租迹小程序已启动");
});
</script>

<style lang="scss">
page {
  box-sizing: border-box;
  min-height: 100%;
  background: #f5f6f7;
  color: #181a20;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

view, text, image, button, input, swiper, swiper-item {
  box-sizing: border-box;
}

button::after { border: 0; }
</style>

