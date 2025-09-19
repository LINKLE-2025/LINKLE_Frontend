import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFriendSearch } from "@/hooks/useFriendSearch";
import TotalSearchPanel from "@/components/search/TotalSearchPanel";
import { useOutletContext } from "react-router-dom";
import { getCurrentUserId } from "@/api/authApi";

// FriendLayout에서 내려주는 context 타입
type OutletContextType = {
    headerHeight: number;
    footerHeight: number;
};

function TotalSearchPage() {
    const { headerHeight, footerHeight } = useOutletContext<OutletContextType>();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const userId = await getCurrentUserId();
                setLoggedInUserId(userId);
            } catch (err) {
                console.error("현재 유저 ID 불러오기 실패:", err);
            } finally {
                setIsAuthLoading(false);
            }
        })();
    }, []);


    const {
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
    } = useFriendSearch(loggedInUserId ?? 0);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleSearchCallback = useCallback(
        (pageNum?: number) => {
            handleSearch(searchQuery, pageNum);
        },
        [handleSearch, searchQuery]
    );



    return (
        <div className="h-screen flex flex-col bg-white">
            <TotalSearchPanel
                currentUserId={loggedInUserId ?? 0}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={results}
                setSearchResults={setResults}
                // handleSearch={(pageNum?: number) => handleSearch(searchQuery, pageNum)}
                inputRef={inputRef}
                headerHeight={headerHeight}
                footerHeight={footerHeight}
                isSearching={isSearching}
                hasSearched={hasSearched}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                handleSearch={handleSearchCallback}
            />
        </div>
    );
}

export default TotalSearchPage;
