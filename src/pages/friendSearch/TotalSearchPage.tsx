// FriendSearchPage.tsx
import React, { useEffect, useRef, useState } from "react";
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
    const { headerHeight, footerHeight } =
        useOutletContext<OutletContextType>();
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
        searchQuery, setSearchQuery,
        results, setResults,
        isSearching, hasSearched,
        handleSearch,
    } = useFriendSearch(loggedInUserId ?? 0);

    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div
            className="max-w-full mx-auto bg-white min-h-screen"
        // style={{ marginBottom: `${footerHeight}px` }}
        >
            <TotalSearchPanel
                currentUserId={loggedInUserId ?? 0}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={results}
                setSearchResults={setResults}
                handleSearch={() => handleSearch(searchQuery)}
                inputRef={inputRef}
                headerHeight={headerHeight}
                footerHeight={footerHeight}
            />
        </div>
    );
}

export default TotalSearchPage;
