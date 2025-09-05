import { FriendResponse, ProfileType } from "@/types/friend";

export function determineProfileType(
  loggedInUserId: number,
  profileUserId: number,
  friendList: FriendResponse[]
): ProfileType {
  if (loggedInUserId === profileUserId) {
    return "self";
  }

  const relation = friendList.find(
    (f) =>
      (f.userId1 === loggedInUserId && f.userId2 === profileUserId) ||
      (f.userId2 === loggedInUserId && f.userId1 === profileUserId)
  );

  if (!relation) return "stranger";

  if (relation.state === "ACCEPTED") {
    return "friend";
  }

  if (relation.state === "REQUESTED") {
    // 요청 상태면 무조건 wait 처리
    return "wait";
  }

  return "stranger";
}
