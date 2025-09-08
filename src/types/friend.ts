// src/types/friend.ts
export type ProfileType = "self" | "friend" | "wait" | "stranger";

export interface FriendResponse {
  friendId: number;
  userId: number;
  name: string;
  nickname: string;
  imageUrl?: string;
  userId1: number;
  userId2: number;
  state: "REQUESTED" | "ACCEPTED";
}

// UI 전용 타입 (요약)
export interface FriendSummary {
  id: number;
  name: string;
  nickname: string;
  imageUrl?: string;
}
export interface FriendSummaryWithProfileType extends FriendSummary {
  profileType: ProfileType;
}