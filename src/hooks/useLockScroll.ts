import { useEffect } from "react";

// 스크롤 잠금 훅
// active가 true일 때, PC와 모바일의 스크롤을 모두 방지
export function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    // 기존 body overflow 저장
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // PC 스크롤 막기

    // 모바일 터치 스크롤 막기
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      // 원상복구
      document.body.style.overflow = prev;
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [active]);
}
