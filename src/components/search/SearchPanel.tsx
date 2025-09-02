// src/components/search/SearchPanel.tsx
import type { RefObject, KeyboardEvent } from "react";

export interface SearchResult {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  handleSearch: (page?: number) => void;
  handleResultClick: (item: SearchResult) => void;
  inputRef: RefObject<HTMLInputElement>;
  hasNextPage: boolean;
  currentPage: number;
  onOpenModal: (item: SearchResult) => void; // 🔹 추가
}

export default function SearchPanel({
  searchQuery,
  setSearchQuery,
  searchResults,
  handleSearch,
  handleResultClick,
  inputRef,
  hasNextPage,
  currentPage,
  onOpenModal,
}: SearchPanelProps) {
  return (
    <div className='flex flex-col h-full bg-white'>
      <div className='flex p-2'>
        <input
          ref={inputRef}
          type='text'
          placeholder='검색어를 입력하세요'
          className='flex-1 px-3 py-3 border border-gray-300 rounded-l-lg text-base outline-none'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              handleSearch(1);
              e.currentTarget.blur();
            }
          }}
          aria-label='장소 검색'
        />
        <button
          type='button'
          onClick={() => handleSearch(1)}
          className='px-3 border border-blue-500 bg-blue-500 text-white rounded-r-lg flex items-center justify-center cursor-pointer'
        >
          🔍
        </button>
      </div>

      <div className='flex-1 p-2 overflow-y-auto'>
        {searchResults.map((item, idx) => (
          <div
            key={idx}
            className='flex justify-between items-center py-2 border-b border-gray-200'
          >
            <div className='text-left'>
              <div className='font-medium'>{item.name}</div>
              <div className='text-sm text-gray-500'>{item.address}</div>
            </div>
            <button
              type='button'
              onClick={() => onOpenModal(item)} // 🔹 링커 추가 버튼
              className='ml-2 px-3 py-1 rounded-lg bg-green-500 text-white text-sm'
            >
              링커 추가
            </button>
          </div>
        ))}

        {hasNextPage && (
          <button
            type='button'
            onClick={() => handleSearch(currentPage + 1)}
            className='w-full py-2 mt-2 rounded-lg bg-blue-500 text-white cursor-pointer'
          >
            계속 검색하기
          </button>
        )}

        {searchResults.length === 0 && searchQuery && (
          <div className='text-gray-400 mt-2'>검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
