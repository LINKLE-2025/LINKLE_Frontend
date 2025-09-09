import { FriendResponse } from "../types/friend";


export const fetchFriendSearchResults = async (
    query: string,
    currentUserId: number
): Promise<FriendResponse[]> => {
    const res = await fetch(
        `/api/search/user?word=${encodeURIComponent(query)}&currentUserId=${currentUserId}`
    );


    if (!res.ok) throw new Error("검색 실패");
    const data = await res.json();
    return Array.isArray(data) ? data : [data];
};

