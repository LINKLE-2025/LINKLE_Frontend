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
  friendImage?: string | null;
  lastMessagePreview?: string | null;
  lastMessageDate?: string | null;
  linkerId?: number | null;
}

export interface MemberResponseDTO {
  userId: number;
  name: string;
  image?: string | null;
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
