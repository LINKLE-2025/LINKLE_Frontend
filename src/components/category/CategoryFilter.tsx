// src/components/map/CategoryFilter.tsx
import React from "react";

// 카테고리 관련 상수들을 컴포넌트 내부로 이동
const CATEGORY_NAMES: Record<number, string> = {
  1: "식사",
  2: "카페",
  3: "음악",
  4: "영화",
  5: "독서",
  6: "운동",
  7: "음주",
  8: "학습",
  9: "쇼핑",
  10: "병원",
  11: "게임",
  12: "여행",
};

const CATEGORY_ICONS: Record<number, string> = {
  1: "/icons/category/mealicon.png",
  2: "/icons/category/cafeicon.png",
  3: "/icons/category/musicicon.png",
  4: "/icons/category/movieicon.png",
  5: "/icons/category/readingicon.png",
  6: "/icons/category/exerciseicon.png",
  7: "/icons/category/drinkingicon.png",
  8: "/icons/category/learningicon.png",
  9: "/icons/category/shoppingicon.png",
  10: "/icons/category/hospitalicon.png",
  11: "/icons/category/gameicon.png",
  12: "/icons/category/travelicon.png",
};

interface CategoryFilterProps {
  // 패널 열림/닫힘 상태
  isOpen: boolean;

  // 현재 선택된 카테고리들 (Set 형태)
  selectedCategories: Set<number>;

  // 패널 닫기 함수
  onClose: () => void;

  // 개별 카테고리 토글 함수
  onCategoryToggle: (categoryId: number) => void;

  // 모든 카테고리 선택 함수
  onSelectAll: () => void;

  // 모든 카테고리 해제 함수
  onClearAll: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  isOpen,
  selectedCategories,
  onClose,
  onCategoryToggle,
  onSelectAll,
  onClearAll,
}) => {
  // 패널이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className='absolute top-0 left-0 w-full bg-white shadow-lg z-20 p-4 border-b border-gray-200'>
      {/* 패널 헤더 */}
      <div className='flex justify-between items-center mb-2'>
        <h3 className='font-semibold text-gray-800 text-lg'>링커 카테고리 선택</h3>

        {/* 헤더 버튼들 */}
        <div className='flex gap-2'>
          {/* 전체 선택 버튼 */}
          <button
            onClick={() => {
              console.log("전체 선택 버튼 클릭");
              onSelectAll();
            }}
            className='px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors'
          >
            ✅
          </button>

          {/* 전체 해제 버튼 */}
          <button
            onClick={() => {
              console.log("전체 해제 버튼 클릭");
              onClearAll();
            }}
            className='px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors'
          >
            ❌
          </button>

          {/* 패널 닫기 버튼 */}
          <button
            onClick={() => {
              console.log("카테고리 패널 닫기");
              onClose();
            }}
            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors'
          >
            ⭐
          </button>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className='grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-1'>
        {Object.entries(CATEGORY_NAMES).map(([id, name]) => {
          const categoryId = Number(id);
          const isSelected = selectedCategories.has(categoryId);

          return (
            <button
              key={categoryId}
              onClick={() => {
                console.log(`카테고리 버튼 클릭: ${name} (ID: ${categoryId})`);
                onCategoryToggle(categoryId);
              }}
              className={`flex flex-row items-center w-full h-14 px-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              {/* 카테고리 아이콘 */}
              <div className='w-8 h-8 mr-1 flex items-center justify-center'>
                <img
                  src={CATEGORY_ICONS[categoryId]}
                  alt={name}
                  className='w-6 h-6 object-contain'
                  onError={(e) => {
                    console.log(`아이콘 로드 실패: ${CATEGORY_ICONS[categoryId]}`);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* 카테고리 이름 */}
              <span
                className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 선택된 카테고리 수 표시 (선택사항) */}
      {selectedCategories.size > 0 && (
        <div className='mt-2 pt-2 border-t border-gray-200'>
          <p className='text-sm text-gray-600'>선택된 카테고리: {selectedCategories.size}개</p>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
