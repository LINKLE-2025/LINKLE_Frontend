export type RoomType = "DM" | "LIGHT" | "CLASS";

export interface RoomResponseDTO {
  roomId: number;
  roomType: RoomType;
  roomName?: string | null;
  description?: string | null;
  memo?: string | null;
  themeColor?: string | null;
  entryFee?: number | null;
  startDate?: string | null;
  ownerId?: number | null;
  createdDate?: string | null;
  memberCount?: number | null;
  unreadCount?: number | null;
  friendUserId?: number | null;
  friendName?: string | null;
  friendNickname?: string | null;
  friendImage?: string | null;
  friendGender?: string | null;
  lastMessagePreview?: string | null;
  lastMessageDate?: string | null;
  linkerId?: number | null;
  isMember?: boolean;
}

export interface MemberResponseDTO {
  userId: number;
  name: string;
  image?: string | null;
  nickname?: string | null;
  gender?: string | null;
}

export type MessageType = "TEXT" | "SYSTEM";

export interface MessageResponseDTO {
  messageId: number;
  roomId: number;
  messageType: MessageType;
  content: string;
  createdDate: string;
  senderId?: number | null;
  senderName?: string | null;
  senderImage?: string | null;
  senderGender?: string | null;
}

export interface CreateRoomRequestDTO {
  roomType: "LIGHT" | "CLASS";
  roomName: string;
  description: string;
  memo: string;
  themeColor: number; // 1~9
  entryFee?: number;
  startDate?: string;
}

export interface ReadSyncRequestDTO {
  roomId: number;
  lastReadMessageId: number;
}

export interface MyReadStateDTO {
  lastReadMessageId?: number | null;
  lastReadAt?: string | null;
}
