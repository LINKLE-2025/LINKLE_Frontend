// src/pages/FriendSearchPage.tsx
import React, { useEffect, useRef } from "react";
import { useFriendSearch } from "@/hooks/useFriendSearch";
import FriendSearchPanel from "@/components/search/FriendSearchPanel";

function FriendSearchPage() {
    const currentUserId = 1;

    // 커스텀 훅 사용
    const {
        searchQuery,
        setSearchQuery,
        results,
        setResults,
        isSearching,
        hasSearched,
        handleSearch,
    } = useFriendSearch(currentUserId);

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery, handleSearch]);

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen">
            {/* 검색 패널 */}
            <FriendSearchPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={results}
                setSearchResults={setResults}
                handleSearch={() => handleSearch(searchQuery)}
                inputRef={inputRef}
                currentUserId={currentUserId}
            />
        </div>
    );
}

export default FriendSearchPage;
