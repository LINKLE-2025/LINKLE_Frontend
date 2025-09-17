import * as chatApi from "@/api/chatApi";
import type { CreateRoomRequestDTO } from "@/types/chat";

/** 채팅방 목록 */
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

/** DM 방 생성/열기 */
export const createDmRoom = (targetUserId: number) => chatApi.createDmRoom(targetUserId);
export const openDm = (targetUserId: number) => chatApi.createDmRoom(targetUserId);

/**
 * 그룹/클래스 방 생성
 * - payload: CreateRoomRequestDTO (roomType, roomName, description, memo, themeColor, entryFee?, startDate?, linkerId?)
 * - backgroundFile: 방 배경 이미지(선택). 있으면 멀티파트, 없으면 JSON.
 */
export const createGroupRoom = (payload: CreateRoomRequestDTO, backgroundFile?: File) =>
  chatApi.createGroupRoom(payload, backgroundFile);

/** 링커별 방 조회 */
export const getRoomsByLinker = (linkerId: number) => chatApi.getRoomsByLinker(linkerId);

/** 방 참여/나가기 */
export const joinRoom = (roomId: number) => chatApi.joinRoom(roomId);
export const leaveRoom = (roomId: number) => chatApi.leaveRoom(roomId);
