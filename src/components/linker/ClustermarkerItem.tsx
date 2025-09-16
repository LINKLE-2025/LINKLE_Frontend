// src/components/map/ClusterMarkerList.tsx
import React from "react";
import { Sheet } from "react-modal-sheet";
import { useOutletContext } from "react-router-dom";
interface ClusterMarkerItem {
  marker: any;
  data: any;
  linkerId: number;
  name: string;
  address: string;
  categoryId: number;
  lat: number;
  lng: number;
}

interface ClusterMarkerListProps {
  isOpen: boolean;
  markers: ClusterMarkerItem[];
  onClose: () => void;
  onMarkerClick: (linkerId: number) => void;
}

// 카테고리 이름 매핑
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

// 카테고리 아이콘 매핑
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
  13: "/icons/category/shinhanicon.png",
};

const ClusterMarkerList: React.FC<ClusterMarkerListProps> = ({
  isOpen,
  markers,
  onClose,
  onMarkerClick,
}) => {
  if (!isOpen) return null;
  type LayoutContext = { headerHeight: number; footerHeight: number };
  const { footerHeight } = useOutletContext<LayoutContext>();
  return (
    <Sheet isOpen={isOpen} onClose={onClose} snapPoints={[0.65, 0.4]} initialSnap={0}
      style={{ bottom: footerHeight }}>
      <Sheet.Container>
        <Sheet.Header>
          <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
          <div className='px-4 pb-3 pt-1'>
            <h2 className='text-lg font-semibold text-gray-800'>
              이 지역의 링커 ({markers.length}개)
            </h2>
          </div>
        </Sheet.Header>

        <Sheet.Content>
          <div className='px-4 pb-4' style={{ maxHeight: "46vh", overflowY: "auto" }}>
            <div className='space-y-3'>
              {markers.map((item, index) => {
                const categoryName = CATEGORY_NAMES[item.categoryId] || "기타";
                const categoryIcon = CATEGORY_ICONS[item.categoryId] || "/icons/default.png";

                return (
                  <button
                    key={`${item.linkerId}-${index}`}
                    onClick={() => {
                      console.log(`클러스터 마커 클릭: ${item.name} (링커 ID: ${item.linkerId})`);
                      onMarkerClick(item.linkerId);
                      onClose();
                    }}
                    className='w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left'
                  >
                    <div className='flex items-start space-x-3'>
                      {/* 카테고리 아이콘 */}
                      <div className='flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg'>
                        <img
                          src={categoryIcon}
                          alt={categoryName}
                          className='w-6 h-6 object-contain'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>

                      {/* 링커 정보 */}
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-900 truncate'>{item.name}</h3>
                        <p className='text-sm text-gray-600 truncate mt-1'>{item.address}</p>
                        <div className='flex items-center mt-2'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700'>
                            {categoryName}
                          </span>
                        </div>
                      </div>

                      {/* 화살표 */}
                      <div className='flex-shrink-0 text-gray-400'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 빈 상태 표시 */}
            {markers.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                <p>표시할 링커가 없습니다.</p>
              </div>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};

export default ClusterMarkerList;
