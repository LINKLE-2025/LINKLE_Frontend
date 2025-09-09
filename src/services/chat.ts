// src/services/chat.ts
import * as chatApi from "@/api/chatApi";

/** 채팅방 목록: UI에서 쓰던 시그니처 유지 */
export const fetchRooms = () => chatApi.getRoomList();

/** 단일 채팅방 정보 */
export const fetchRoom = (roomId: number) => chatApi.getRoom(roomId);

/** 메시지 목록 조회 */
export const fetchMessages = (roomId: number, params?: { beforeId?: number; size?: number }) =>
  chatApi.getRoomMessages(roomId, params);

/** 메시지 전송 */
export const sendMessage = (roomId: number, content: string) =>
  chatApi.sendMessage(roomId, { content });

/** 읽음 처리 */
export const markRead = (roomId: number, lastMessageId: number) =>
  chatApi.markRead(roomId, lastMessageId);

/** DM 방 생성 */
export const createDmRoom = (targetUserId: number) => chatApi.createDmRoom(targetUserId);

/** 그룹 방 생성 */
export const createGroupRoom = (payload: { name: string; memberIds: number[] }) =>
  chatApi.createGroupRoom(payload);

/** DM 방 열기 */
export const openDm = (targetUserId: number) => chatApi.createDmRoom(targetUserId);
