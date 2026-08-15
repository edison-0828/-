import { ref } from "vue";
import { onHide, onShow, onUnload } from "@dcloudio/uni-app";

export function useTabPageTransition() {
  const pageReady = ref(false);
  let animationTimer: ReturnType<typeof setTimeout> | undefined;

  function clearAnimationTimer() {
    if (animationTimer !== undefined) clearTimeout(animationTimer);
    animationTimer = undefined;
  }

  onShow(() => {
    clearAnimationTimer();
    pageReady.value = false;
    animationTimer = setTimeout(() => {
      pageReady.value = true;
      animationTimer = undefined;
    }, 24);
  });

  onHide(() => {
    clearAnimationTimer();
    pageReady.value = false;
  });

  onUnload(clearAnimationTimer);

  return { pageReady };
}
