// src/api/chatApi.ts
import apiClient from "./apiClient";
import { getCurrentUserId } from "./authApi";

const DEV_UID = await getCurrentUserId().catch(() => {});

/** 내가 참여 중인 방 목록: GET /chat/room */
export async function getRoomList() {
  const { data } = await apiClient.get("/chat/room", {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

/** 방 단건 조회: GET /chat/room/{roomId} */
export async function getRoom(roomId: number) {
  const { data } = await apiClient.get(`/chat/room/${roomId}`, {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

/** 메시지 목록: GET /chat/room/{roomId}/messages?beforeId&size */
export async function getRoomMessages(
  roomId: number,
  params?: { beforeId?: number; size?: number },
) {
  const { data } = await apiClient.get(`/chat/room/${roomId}/messages`, {
    params,
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

/** 메시지 전송: POST /chat/room/{roomId}/messages */
export async function sendMessage(roomId: number, body: { content: string }) {
  const { data } = await apiClient.post(`/chat/room/${roomId}/messages`, body, {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

/** 읽음 동기화: POST /chat/read  (⚠️ roomId 포함) */
export async function markRead(roomId: number, lastMessageId: number) {
  const { data } = await apiClient.post(
    `/chat/read`,
    { roomId, lastMessageId },
    { headers: { "x-user-id": DEV_UID } },
  );
  return data;
}

/** DM 열기/조회: POST /chat/room/dm */
export async function createDmRoom(targetUserId: number) {
  const { data } = await apiClient.post(
    "/chat/room/dm",
    { targetUserId },
    { headers: { "x-user-id": DEV_UID } },
  );
  return data;
}

/** 그룹/클래스 방 생성: POST /chat/room */
export async function createGroupRoom(payload: { name: string; memberIds: number[] }) {
  const { data } = await apiClient.post("/chat/room", payload, {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}
