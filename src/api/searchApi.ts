import { FriendResponse } from "@/types/friend";
import apiClient from "./apiClient";


export const searchLinkers = async (
  word: string,
  page: number,
  size: number=10
) => {
  console.log("ad",word, page, size)
  const res = await apiClient.get("/search/linker", {
    params: { word, page, size },
  });
  console.log(res.data,"asdsadasdsa")
  return res.data;
};



export const getFriendSearchResults = async (
  query: string,
  currentUserId: number,
  page: number = 0,
  size: number = 10
) => {
  const res = await apiClient.get("/search/user", {
    params: { word: query, currentUserId, page, size },
  });
  return res.data;
};
