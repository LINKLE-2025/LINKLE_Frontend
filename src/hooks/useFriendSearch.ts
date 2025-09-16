import { useState, useCallback, useEffect } from "react";
import { FriendResponse, FriendSummaryWithProfileType } from "../types/friend";
import { determineProfileTypes } from "../utils/determineProfileTypes";
import { getFriends } from "@/api/friendApi";
import { fetchFriendSearchResults } from "@/services/friendService";

export const useFriendSearch = (currentUserId: number) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<FriendSummaryWithProfileType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [friendList, setFriendList] = useState<FriendResponse[]>([]);

  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 내 친구 목록 불러오기
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await getFriends(currentUserId);
        setFriendList(data);
      } catch (err) {
        console.error("친구 목록 불러오기 실패:", err);
      }
    };
    loadFriends();
  }, [currentUserId]);

  // 검색 핸들러 (Pageable 사용)
  const handleSearch = useCallback(
    async (query: string, pageNum: number = 0) => {
      try {
        setIsSearching(true);
        setHasSearched(true);

        const response = await fetchFriendSearchResults(query, currentUserId, pageNum);
        const profileList = determineProfileTypes(
          response.content ?? [],
          currentUserId,
          friendList ?? []
        );

        setResults(profileList);
        setPage(response.number);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("검색 실패:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [currentUserId, friendList]
  );

  // 검색어 변경 시 디바운싱 처리
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      handleSearch(searchQuery, 0); // 검색 시 첫 페이지로 초기화
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, handleSearch]);

  // 페이지 변경 시 자동 검색 실행
  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      // console.log("Adsad",page)
      handleSearch(searchQuery, page);
    }
  }, [page, handleSearch, hasSearched, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    setResults,
    isSearching,
    hasSearched,
    handleSearch,
    page,
    totalPages,
    setPage,
  };
};
