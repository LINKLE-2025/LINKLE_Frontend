import { getFriendSearchResults } from "@/api/searchApi";
import { FriendResponse } from "../types/friend";


export const fetchFriendSearchResults = async (
    query: string,
    currentUserId: number,
    page: number = 0,
    size: number = 10
  ) => {
    return await getFriendSearchResults(query, currentUserId, page, size);
    // Page 객체 그대로 넘김
  };