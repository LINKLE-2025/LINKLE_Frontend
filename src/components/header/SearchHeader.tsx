// components/header/SearchHeader.tsx
import React, {
  type RefObject,
  type KeyboardEvent,
  forwardRef,
} from "react";
import { Search } from "lucide-react";

type SearchHeaderProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
  inputRef?: RefObject<HTMLInputElement>;
};

// forwardRef 사용
const SearchHeader = forwardRef<HTMLDivElement, SearchHeaderProps>(
  (
    {
      searchQuery,
      setSearchQuery,
      onSearch,
      placeholder = "검색어를 입력하세요",
      className = "",
      inputRef,
    },
    ref
  ) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        if (searchQuery.trim() === "") {
          e.preventDefault();
          return;
        }
        onSearch();
        e.currentTarget.blur();
      }
    };

    return (
      <header
        ref={ref}
        className={`fixed top-0 w-full bg-white z-50 border-b border-gray-200 ${className}`}
      >
        <div className="flex items-center px-1 py-2.5 gap-2">
          <div className="relative flex-1 mx-4">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className="w-full pl-5 pr-10 py-1.5 bg-gray-100 rounded-full text-base focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              onClick={() => {
                if (searchQuery.trim() !== "" && onSearch) {
                  onSearch();
                }
              }}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    );
  }
);

// display name for debugging
SearchHeader.displayName = "SearchHeader";

export default SearchHeader;
