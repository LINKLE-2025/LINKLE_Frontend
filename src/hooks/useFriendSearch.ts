import { useState, useCallback, useEffect } from "react";
import { fetchFriendSearchResults } from "../services/friendService";
import { FriendResponse, FriendSummaryWithProfileType } from "../types/friend";
import { determineProfileTypes } from "../utils/determineProfileTypes";
import { getFriends } from "@/api/friendApi";

export const useFriendSearch = (currentUserId: number) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<FriendSummaryWithProfileType[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [friendList, setFriendList] = useState<FriendResponse[]>([]);


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

    // ✅ 검색 핸들러
    const handleSearch = useCallback(async (query: string) => {
        try {
            setIsSearching(true);
            setHasSearched(true);

            const response = await fetchFriendSearchResults(query, currentUserId);
            const profileList = determineProfileTypes(response, currentUserId, friendList);

            setResults(profileList);
        } catch (error) {
            console.error("검색 실패:", error);
        } finally {
            setIsSearching(false);
        }
    }, [currentUserId, friendList]);

    // ✅ 디바운싱 적용
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery, handleSearch]);

    return {
        searchQuery,
        setSearchQuery,
        results,
        setResults,
        isSearching,
        hasSearched,
        handleSearch,
    };
};
