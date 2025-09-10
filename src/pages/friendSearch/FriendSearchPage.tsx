// FriendSearchPage.tsx
import React, { useRef } from "react";
import { useFriendSearch } from "@/hooks/useFriendSearch";
import FriendSearchPanel from "@/components/search/FriendSearchPanel";
import { useOutletContext } from "react-router-dom";

// FriendLayout에서 내려주는 context 타입
type OutletContextType = {
    loggedInUserId: number | null;
    headerHeight: number;
    footerHeight: number;
};

function FriendSearchPage() {
    const { loggedInUserId, headerHeight, footerHeight } =
        useOutletContext<OutletContextType>();

    const {
        searchQuery, setSearchQuery,
        results, setResults,
        isSearching, hasSearched,
        handleSearch,
    } = useFriendSearch(loggedInUserId ?? 0);

    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div
            className="max-w-md mx-auto bg-white min-h-screen"
            style={{ paddingTop: headerHeight, paddingBottom: footerHeight }}
        >
            <FriendSearchPanel
                currentUserId={loggedInUserId ?? 0}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={results}
                setSearchResults={setResults}
                handleSearch={() => handleSearch(searchQuery)}
                inputRef={inputRef}
            />
        </div>
    );
}

export default FriendSearchPage;
