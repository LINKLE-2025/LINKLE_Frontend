import { FriendResponse } from "../types/friend";


export const fetchFriendSearchResults = async (
    query: string,
    currentUserId: number
): Promise<FriendResponse[]> => {
    // console.log('Fetching friend search results for query:', query, 'and currentUserId:', currentUserId);
    const res = await fetch(
        `/api/search/user?word=${encodeURIComponent(query)}&currentUserId=${currentUserId}`
    );


    if (!res.ok) throw new Error("검색 실패");
    const data = await res.json();
    console.log("Fetched data:", data);
    return Array.isArray(data) ? data : [data];
};

export async function fetchFriendList(currentUserId: number): Promise<FriendResponse[]> {
    const res = await fetch(`/api/friends?userId=${currentUserId}`);
    if (!res.ok) throw new Error("친구 목록을 불러오는 데 실패했습니다.");
    return res.json();
}