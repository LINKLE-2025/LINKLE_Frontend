// utils/determineProfileType.ts

import { FriendResponse, ProfileType } from "@/types/friend";
import { determineProfileType } from "./determineProfileType";

export interface FriendSummaryWithProfileType {
    id: number;
    name: string;
    nickname: string;
    imageUrl?: string;
    profileType: ProfileType;
}

// 여러 명 검색 시 프로필 타입 판단
export function determineProfileTypes(
    searchResults: FriendResponse[],
    currentUserId: number,
    friendList: FriendResponse[]
): FriendSummaryWithProfileType[] {
    return searchResults.map((user) => ({
        id: user.userId,
        name: user.name,
        nickname: user.nickname,
        imageUrl: user.imageUrl,
        profileType: determineProfileType(currentUserId, user.userId, friendList),
    }));
}
