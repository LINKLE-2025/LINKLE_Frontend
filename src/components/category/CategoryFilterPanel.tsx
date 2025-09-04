interface Props {
  selectedCategories: Set<number>;
  toggleCategoryFilter: (id: number) => void;
  clearAllFilters: () => void;
  selectAllCategories: () => void;
  onClose: () => void;
  CATEGORY_NAMES: Record<number, string>;
  CATEGORY_ICONS: Record<number, string>;
}

export default function CategoryFilterPanel({
  selectedCategories,
  toggleCategoryFilter,
  clearAllFilters,
  selectAllCategories,
  onClose,
  CATEGORY_NAMES,
  CATEGORY_ICONS,
}: Props) {
  return (
    <div className='absolute top-[110px] left-0 w-full bg-white shadow-lg z-20 p-4 border-b border-gray-200'>
      {/* 패널 헤더 */}
      <div className='flex justify-between items-center mb-4'>
        <h3 className='font-semibold text-gray-800 text-lg'>🏷️ 링커 카테고리 선택</h3>
        <div className='flex gap-2'>
          <button
            onClick={clearAllFilters}
            className='px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors'
          >
            전체 해제
          </button>
          <button
            onClick={selectAllCategories}
            className='px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors'
          >
            전체 선택
          </button>
          <button
            onClick={onClose}
            className='px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors'
          >
            닫기
          </button>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className='grid grid-cols-4 gap-3 mb-4'>
        {Object.entries(CATEGORY_NAMES).map(([id, name]) => {
          const categoryId = Number(id);
          const isSelected = selectedCategories.has(categoryId);
          return (
            <button
              key={categoryId}
              onClick={() => toggleCategoryFilter(categoryId)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className='w-8 h-8 mb-2 flex items-center justify-center'>
                <img
                  src={CATEGORY_ICONS[categoryId]}
                  alt={name}
                  className='w-6 h-6 object-contain'
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              </div>
              <span
                className={`text-xs font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}
              >
                {name}
              </span>
              {isSelected && (
                <div className='absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs'>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
