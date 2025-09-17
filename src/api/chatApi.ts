import apiClient from "./apiClient";
import { getCurrentUserId } from "./authApi";
import type { CreateRoomRequestDTO, RoomResponseDTO } from "@/types/chat";

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

/** 읽음 동기화: POST /chat/read */
export async function markRead(roomId: number, lastReadMessageId: number) {
  const { data } = await apiClient.post(
    `/chat/read`,
    { roomId, lastReadMessageId },
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

/**
 * 그룹/클래스 방 생성: POST /chat/room
 * - 파일이 있으면 multipart(dto + background)
 * - 파일이 없으면 JSON
 */
export async function createGroupRoom(payload: CreateRoomRequestDTO, backgroundFile?: File) {
  if (backgroundFile) {
    const fd = new FormData();
    fd.append("dto", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    fd.append("background", backgroundFile);
    const { data } = await apiClient.post<RoomResponseDTO>("/chat/room", fd, {
      headers: { "x-user-id": DEV_UID }, // Content-Type은 자동 설정
    });
    return data;
  } else {
    const { data } = await apiClient.post<RoomResponseDTO>("/chat/room", payload, {
      headers: { "x-user-id": DEV_UID, "Content-Type": "application/json" },
    });
    return data;
  }
}

/** 특정 링커의 모든 방: GET /chat/room/by-linker */
export async function getRoomsByLinker(linkerId: number) {
  const { data } = await apiClient.get("/chat/room/by-linker", {
    params: { linkerId },
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

/** 방 들어오기 */
export async function joinRoom(roomId: number) {
  const { data } = await apiClient.post(`/chat/room/${roomId}/join`, null, {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

/** 방 나가기 */
export async function leaveRoom(roomId: number) {
  const uid = await getCurrentUserId().catch(() => undefined);
  const { data } = await apiClient.post(`/chat/room/${roomId}/leave`, null, {
    headers: { "x-user-id": uid },
  });
  return data;
}
