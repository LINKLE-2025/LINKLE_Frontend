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
