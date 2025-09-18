// src/hooks/useUnreadTotal.ts
import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRooms } from "@/services/chat";
import { stompClient } from "@/lib/stompClient";
import { useAuthStore } from "@/store/authStore";
import type { RoomResponseDTO } from "@/types/chat";

export default function useUnreadTotal() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery<RoomResponseDTO[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchRooms,
    staleTime: 10_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 합계 계산
  const total = useMemo(
    () =>
      (data ?? []).reduce((sum, r: any) => {
        const n = Number(r?.unreadCount ?? 0);
        return sum + (Number.isFinite(n) ? Math.max(0, n) : 0);
      }, 0),
    [data],
  );

  // 유저 토픽 구독해서 캐시 새로고침 (중복 호출 방지를 위해 간단 디바운스)
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!user?.userId) return;

    const topic = `/sub/users.${user.userId}.room-updates`;
    const off = stompClient.subscribe(topic, () => {
      if (debounceRef.current) cancelAnimationFrame(debounceRef.current);
      debounceRef.current = requestAnimationFrame(() => {
        // 서버에서 최신 unread가 계산되어 내려오도록 방 목록만 재조회
        queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      }) as unknown as number;
    });

    return () => {
      try {
        off?.();
      } catch {}
      if (debounceRef.current) cancelAnimationFrame(debounceRef.current);
    };
  }, [user?.userId, queryClient]);

  return total;
}
