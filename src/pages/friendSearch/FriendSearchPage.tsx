// src/pages/FriendSearchPage.tsx
import React, { useRef } from "react";
import { useFriendSearch } from "@/hooks/useFriendSearch";
import FriendSearchPanel from "@/components/search/FriendSearchPanel";
import { useOutletContext } from "react-router-dom";

// 로그인한 유저 아이디
type OutletContextType = { loggedInUserId: number };

function FriendSearchPage() {
    const { loggedInUserId } = useOutletContext<OutletContextType>();

    // 커스텀 훅 사용 (훅이 친구목록 로드 + 디바운스 처리까지 담당)
    const {
        searchQuery, setSearchQuery,
        results, setResults,
        isSearching, hasSearched,
        handleSearch,
    } = useFriendSearch(loggedInUserId);

    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen">
            <FriendSearchPanel
                currentUserId={loggedInUserId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={results}
                setSearchResults={setResults}
                // 엔터/버튼 클릭 시 최신 query로 실행
                handleSearch={() => handleSearch(searchQuery)}
                inputRef={inputRef}
            />
            {/* 필요하면 로딩/상태 표시 */}
            {/* {isSearching && <div className="p-2 text-sm text-gray-500">검색 중…</div>} */}
            {/* {!isSearching && hasSearched && results.length === 0 && <div className="p-2 text-sm text-gray-500">검색 결과가 없습니다</div>} */}
        </div>
    );
}

export default FriendSearchPage;
