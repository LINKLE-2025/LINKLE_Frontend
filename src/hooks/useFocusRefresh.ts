import { useEffect, useRef } from "react";
import { refreshToken } from "@/api/authApi";

export default function useFocusRefresh(nMinutes: number = 10) {
  const lastRefreshRef = useRef<number>(0);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      // 페이지가 포커스(visible) 상태로 전환될 때
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const elapsed = now - lastRefreshRef.current; // 마지막 갱신 후 경과 시간

        // 마지막 갱신이 n분 이상 전이면 토큰 갱신 시도
        if (elapsed > nMinutes * 60 * 1000) {
          try {
            await refreshToken();
            lastRefreshRef.current = now;
            console.log("🔄 포커스 복귀 - 토큰 갱신 완료");
          } catch (err) {
            console.error("❌ 포커스 복귀 - 토큰 갱신 실패", err);
          }
        } else {
          console.log(
            "⏸ 포커스 복귀 - 토큰 갱신 남은 시간: " +
              Math.round((nMinutes * 60 * 1000 - elapsed) / 1000) +
              "초",
          );
        }
      }
    };

    // 페이지 가시성 변경 이벤트 리스너 등록
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [nMinutes]);
}
