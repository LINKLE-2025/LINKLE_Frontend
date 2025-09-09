// src/types/friend.ts
export type ProfileType = "self" | "friend" | "wait" | "stranger";

export interface FriendResponse {
  friendId: number;
  userId: number;
  name: string;
  nickname: string;
  image?: string;
  userId1: number;
  userId2: number;
  state: "REQUESTED" | "ACCEPTED";
  gender?: string;
}

// UI 전용 타입 (요약)
export interface FriendSummary {
  friendUserid: number;
  name: string;
  nickname: string;
  image?: string;
  gender?: string;
}
export interface FriendSummaryWithProfileType extends FriendSummary {
  profileType: ProfileType;
}