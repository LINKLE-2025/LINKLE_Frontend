import { stompClient } from "@/lib/stompClient";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function useStomp() {
  // 로그인한 사용자 상태 가져오기
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return; // 로그인 전에는 연결하지 않음

    console.log("🔄 STOMP 연결 초기화 시도...");

    stompClient.init(import.meta.env.VITE_WS_URL, {
      "x-user-id": String(user.userId ?? ""),
      // Authorization: `Bearer ${accessToken}`, // 필요하면 여기에
    });

    // cleanup 필요시 추가
  }, [user]);
}
