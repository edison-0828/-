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

.tab-page-transition {
  opacity: 0.72;
  transform: translate3d(0, 12rpx, 0) scale(0.992);
  transform-origin: 50% 30%;
  transition:
    opacity 240ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.tab-page-transition.tab-page-ready {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .tab-page-transition,
  .tab-page-transition.tab-page-ready {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
