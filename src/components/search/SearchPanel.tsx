// src/components/search/SearchPanel.tsx
import type { RefObject, KeyboardEvent } from "react";

export interface SearchResult {
  name: string; // 상호명
  address: string;
  lat: number;
  lng: number;
}

export interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  handleSearch: (page?: number) => void;
  handleResultClick: (item: SearchResult) => void;
  inputRef: RefObject<HTMLInputElement | null>;
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
      <div className='flex items-center p-2 border-b border-gray-200 gap-x-2'>
        <input
          ref={inputRef}
          type='text'
          placeholder='장소 검색'
          className='flex-1 px-3 py-3 rounded-lg bg-gray-100 text-base outline-none'
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
          className='w-14 h-12 flex items-center justify-center bg-white  cursor-pointer'
        >
          <img
            src='/icons/search.png' // 🔍 돋보기 이미지 경로
            alt='검색'
            className='w-7 h-7'
          />
        </button>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto p-2'>
        {searchResults.map((item, idx) => (
          <div
            key={idx}
            className='flex justify-between items-center py-2 border-b border-gray-200 px-2 gap-x-4'
            onClick={() => handleResultClick(item)}
          >
            <div className='text-left'>
              <div className='font-medium text-lg'>{item.name}</div>
              <div className='text-sm text-gray-500'>{item.address}</div>
            </div>
            <img
              src='/icons/linker.png'
              alt='링커 추가'
              className='w-12 h-12 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(item);
              }}
            />
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
