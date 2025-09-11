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
  onOpenLinkerList: (item: SearchResult) => void; // 링커 리스트 모달 열기
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
  onOpenLinkerList,
}: SearchPanelProps) {
  return (
    <div className='flex flex-col h-full bg-white'>
      <div className='flex items-center p-2 border-b border-gray-200 gap-x-2'>
        <input
          id='search-input'
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
            src='/icons/mapicon/search.png' // 🔍 돋보기 이미지 경로
            alt='검색'
            className='w-7 h-7'
          />
        </button>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto p-2'>
        {/* 🔹 검색 결과가 있을 때 */}
        {searchResults.length > 0 ? (
          searchResults.map((item, idx) => (
            <div
              key={idx}
              className='flex justify-between items-center py-2 border-b border-gray-200 px-2 gap-x-4'
              onClick={() => handleResultClick(item)}
            >
              <div className='text-left'>
                <div className='font-medium text-lg'>{item.name}</div>
                <div className='text-sm text-gray-500'>{item.address}</div>
              </div>
              {/* 이미 불러온 링커 중에서 목록 매칭/열기 */}
              <div className="flex flex-row items-center gap-x-4">
                <img
                  src='/icons/mapicon/linkerList.png'
                  alt='링커 리스트'
                  className='w-12 h-12 cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLinkerList(item); // 🔥 여러 개 리스트 모달 열기
                  }}
                />
                <img
                  src='/icons/mapicon/linker.png'
                  alt='링커 추가'
                  className='w-12 h-12 cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenModal(item); // 🔹 모달 열기
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          /* 🔹 검색 결과가 없을 때 워터마크 */
          <div className='flex flex-col items-center justify-center h-full text-gray-400 mt-4'>
            <img
              src='/icons/favicon/favicon.svg' // 🔹 워터마크 이미지 경로
              alt='워터마크'
              className='w-24 h-24 opacity-20 mb-4' // 크기, 투명도, 아래 여백
            />
            <div className='text-center'>
              링커에 참여하고<br></br>나만의 추억을 기록해보세요
            </div>{" "}
            {/* 안내 문구 */}
          </div>
        )}

        {/* 🔹 다음 페이지 버튼 */}
        {hasNextPage && (
          <button
            type='button'
            onClick={() => handleSearch(currentPage + 1)}
            className='w-full py-2 mt-2 rounded-lg bg-blue-500 text-white cursor-pointer'
          >
            계속 검색하기
          </button>
        )}
      </div>
    </div>
  );
}
