import { useEffect } from "react";
import apiClient from "@/api/apiClient";

export default function useSilentRefresh() {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Silent Refresh 실행 함수
    const refresh = async () => {
      try {
        await apiClient.post("/auth/refresh", {});
        console.log("🔄 Silent refresh 성공 (쿠키 갱신)");
      } catch (err) {
        console.error("❌ Silent refresh 실패:", err);
        // 실패하면 로그인 페이지로 이동 (쿠키 만료/삭제 시)
        window.location.href = "/login";
      }
    };

    // 일정 주기로 refresh 실행
    const startSilentRefresh = () => {
      // AccessToken 유효 기간에 맞춰 조정하세요 (예: 15분 만료라면 13분마다 refresh)
      const refreshInterval = 13 * 60 * 1000; // 13분
      timer = setInterval(refresh, refreshInterval);
    };

    // 앱 시작 시 바로 한 번 실행 + 주기적 실행 예약
    refresh();
    startSilentRefresh();

    return () => clearInterval(timer);
  }, []);
}
