// src/utils/chatRead.ts
import type { RoomResponseDTO } from "@/types/chat";
import { QueryClient } from "@tanstack/react-query";

export function setRoomUnreadZero(qc: QueryClient, roomId: number) {
  qc.setQueryData<RoomResponseDTO[]>(["chatRooms"], (prev) => {
    if (!prev) return prev;
    const idx = prev.findIndex((r: any) => r.roomId === roomId);
    if (idx < 0) return prev;
    const next = prev.slice();
    next[idx] = { ...next[idx], unreadCount: 0 } as RoomResponseDTO;
    return next;
  });
}
