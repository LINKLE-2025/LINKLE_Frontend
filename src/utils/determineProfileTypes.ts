import { FriendResponse, ProfileType, FriendSummaryWithProfileType } from "@/types/friend";
import { determineProfileType } from "./determineProfileType";

// 여러 명 검색 시 프로필 타입 판단
export function determineProfileTypes(
  searchResults: FriendResponse[],
  currentUserId: number,
  friendList: FriendResponse[]
): FriendSummaryWithProfileType[] {
  return searchResults.map(
    (user): FriendSummaryWithProfileType => ({
      id: user.userId,         // FriendSummaryWithProfileType.id 로 매핑
      name: user.name,
      nickname: user.nickname,
      imageUrl: user.imageUrl,
      gender: user.gender,
      profileType:
        user.state === "ACCEPTED"
          ? "friend"
          : user.state === "REQUESTED"
          ? "wait"
          : determineProfileType(currentUserId, user.userId, friendList),
    })
  );
}
