import { useEffect, useState } from "react";

// 모바일 여부 판단 훅 : 화면 너비가 breakpoint(px) 미만이면 true 반환
// 기본값: 640px (sm)
export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 변경 시마다 체크
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
