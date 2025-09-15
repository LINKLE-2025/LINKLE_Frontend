// components/common/SearchBar.tsx
import React, { type RefObject, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

type SearchBarProps = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    className?: string;
    inputRef?: RefObject<HTMLInputElement>; // optional
};

type OutletContextType = {
    headerHeight: number;
    footerHeight: number;
};

const SearchBar: React.FC<SearchBarProps> = ({
    searchQuery,
    setSearchQuery,
    onSearch,
    placeholder = "검색어를 입력하세요",
    className = "",
    inputRef,
}) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSearch) {
            onSearch();
            e.currentTarget.blur();
        }
    };

    const { headerHeight, footerHeight } =
        useOutletContext<OutletContextType>();

    return (
        <div className={`bg-white px-4 py-1 border-b flex items-center gap-2 ${className}`}>

            <div className="relative flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-5 ml-2 pr-4 bg-linkleGray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                type="button"
                className="px-2 py-2 text-sm text-linkleGray-100 hover:text-blue-600 ml-1"
                onClick={onSearch}
            >
                <Search className="w-7 h-7" />
            </button>
        </div>
    );
};

export default SearchBar;