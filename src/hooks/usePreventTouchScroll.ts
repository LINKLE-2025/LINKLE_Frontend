import { useEffect } from "react";

// 터치 스크롤 방지 훅
// active가 true일 때, 터치 스크롤을 방지
export function usePreventTouchScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [active]);
}
