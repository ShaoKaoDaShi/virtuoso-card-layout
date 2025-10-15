import { useEffect } from "react";

import { debounce } from "lodash";

export const useInitScale = () => {
  useEffect(() => {
    const updateViewport = () => {
      const designWidth = 1920; // 设计稿宽度
      const screenWidth = window.innerWidth;
      if (screenWidth > 768) return;
      const scale = screenWidth / designWidth;
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement("meta");
        viewportMeta.setAttribute("name", "viewport");
        document.head.appendChild(viewportMeta);
      }
      console.log("updateViewport", scale, screenWidth, designWidth);
      viewportMeta.setAttribute(
        "content",
        `width=${designWidth},initial-scale=${scale},minimum-scale=${scale},maximum-scale=${scale},user-scalable=no`
      );
    };

    const debouncedUpdateViewport = debounce(updateViewport, 150);
    // debouncedUpdateViewport();
    // window.addEventListener("resize", debouncedUpdateViewport);
    const observer = new ResizeObserver(debouncedUpdateViewport);
    // meta改变的时候会触发resize事件
    updateViewport(); // Initial call
    observer.observe(document.documentElement);
    return () => {
      observer.disconnect();
    };
  }, []);
};
export default useInitScale;
