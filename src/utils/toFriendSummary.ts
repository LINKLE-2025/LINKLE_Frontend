import { FriendResponse, FriendSummary, ProfileType } from "../types/friend";


export const toFriendSummary = (
    friend: FriendResponse,
    currentUserId: number
): (FriendSummary & { profileType: ProfileType }) => {
    const otherUserId = friend.userId1 === currentUserId ? friend.userId2 : friend.userId1;


    const profileType: ProfileType =
        friend.userId1 === currentUserId || friend.userId2 === currentUserId
            ? friend.state === "ACCEPTED"
                ? "friend"
                : "wait"
            : "stranger";


    return {
        friendUserid: otherUserId,
        name: friend.name,
        nickname: friend.nickname,
        image: friend.image,
        profileType,
    };
};