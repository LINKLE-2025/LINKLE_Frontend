import { useEffect } from "react";
import apiClient from "@/api/apiClient";

export default function useSilentRefresh() {
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          await apiClient.post("/auth/refresh", {});
          console.log("🔄 Silent refresh 성공");
        } catch {
          // 실패 시 처리 필요 없음 → 인터셉터가 잡음
        }
      },
      5 * 6 * 1000,
    );

    return () => clearInterval(interval);
  }, []);
}
