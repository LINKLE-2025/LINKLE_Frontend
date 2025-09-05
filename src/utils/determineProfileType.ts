import { FriendResponse, ProfileType } from "@/types/friend";

export const determineProfileType = (
  loggedInUserId: number,
  profileUserId: number,
  friendList: FriendResponse[]
): ProfileType => {
  if (loggedInUserId === profileUserId) return "self";

  const relation = friendList.find(
    f =>
      (f.userId1 === loggedInUserId && f.userId2 === profileUserId) ||
      (f.userId2 === loggedInUserId && f.userId1 === profileUserId)
  );

  if (!relation) return "stranger";
  if (relation.state === "ACCEPTED") return "friend";
  if (relation.state === "REQUESTED") return "wait";

  return "stranger";
};
