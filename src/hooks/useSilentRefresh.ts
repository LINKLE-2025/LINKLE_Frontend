import { useEffect } from "react";
import { refreshToken } from "@/api/authApi";

export default function useSilentRefresh() {
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          await refreshToken();
        } catch {
          // 실패 시 처리 필요 없음 → 인터셉터가 잡음
        }
      },

      5 * 60 * 1000, // 5분마다 갱신 (Access Token 만료 시간 30분 고려)
    );

    return () => clearInterval(interval);
  }, []);
}
