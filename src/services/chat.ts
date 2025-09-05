import type { RoomType } from "@/types/chat";

export interface RoomResponseDTO {
  roomId: number;
  roomType: RoomType;
  roomName?: string | null;
  friendName?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number | null;
  avatarUrl?: string | null; // DM 아바타 등
}

const API_BASE = import.meta.env.VITE_API_SERVER as string;
const DEV_UID = String(import.meta.env.VITE_DEV_USER_ID ?? "1");

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-user-id": DEV_UID,
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/** 채팅방 목록 */
export async function fetchRooms(): Promise<RoomResponseDTO[]> {
  const data = await api<any>("/chat/room");
  const raw: any[] = Array.isArray(data) ? data : (data?.content ?? []);
  return raw.map((r) => ({
    roomId: r.roomId ?? r.id,
    roomType: r.roomType ?? "DM",
    roomName: r.roomName ?? r.name ?? null,
    friendName: r.friendName ?? r.dmPartnerName ?? null,
    lastMessage: r.lastMessage ?? r.lastMessagePreview ?? null,
    lastMessageAt: r.lastMessageAt ?? r.lastMessageDate ?? null,
    unreadCount: r.unreadCount ?? r.unread ?? 0,
    avatarUrl: r.avatarUrl ?? r.dmPartnerProfileImageUrl ?? null,
  }));
}

/** DM 방 열기(있으면 재사용) */
export async function openDm(targetUserId: number): Promise<RoomResponseDTO> {
  return api<RoomResponseDTO>("/chat/room/dm", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}
