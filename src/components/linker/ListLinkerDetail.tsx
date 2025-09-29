import React from "react";
import { Sheet } from "react-modal-sheet";

interface LinkerItem {
  linkerId: number;
  name: string;
  address: string;
  categoryId: number;
  lat: number;
  lng: number;
}

interface LinkerListModalProps {
  isOpen: boolean;
  linkers: LinkerItem[];
  title?: string; // 모달 제목 (기본값: "검색된 링커")
  onClose: () => void;
  onItemClick: (payload: { linkerId: number; lat: number; lng: number }) => void;
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
  10: "봉사",
  11: "게임",
  12: "여행",
};

// 카테고리 아이콘 매핑
const CATEGORY_ICONS: Record<number, string> = {
  1: "/icons/category/meal.png",
  2: "/icons/category/cafe.png",
  3: "/icons/category/music.png",
  4: "/icons/category/movie.png",
  5: "/icons/category/reading.png",
  6: "/icons/category/exercise.png",
  7: "/icons/category/drinking.png",
  8: "/icons/category/learning.png",
  9: "/icons/category/shopping.png",
  10: "/icons/category/volunteer.png",
  11: "/icons/category/game.png",
  12: "/icons/category/travel.png",
  13: "/icons/category/shinhan.png",
};

const LinkerListModal: React.FC<LinkerListModalProps> = ({
  isOpen,
  linkers,
  title = "검색된 링커",
  onClose,
  onItemClick,
}) => {
  if (!isOpen) return null;

  return (
    <Sheet isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.65, 0.62, 0.59, 0.56, 0.53, 0.5, 0.47, 0.44, 0.41, 0.38, 0.35, 0.32, 0.29, 0.26, 0.23, 0]}
      initialSnap={0}>
      <Sheet.Container style={{ boxShadow: "1px 2px 15px rgba(0, 0, 0, 0.2)" }}>
        <Sheet.Header>
          <div className='mx-auto my-2 h-1.5 w-12 rounded-full bg-gray-300' />
          <div className='px-4 pb-3 pt-1'>
            <h2 className='text-lg font-semibold text-gray-800'>
              {title} ({linkers.length}개)
            </h2>
          </div>
        </Sheet.Header>

        <Sheet.Content>
          <div className='px-4 pb-4'>
            <div className='space-y-3'>
              {linkers.map((item) => {
                const categoryName = CATEGORY_NAMES[item.categoryId] || "기타";
                const categoryIcon = CATEGORY_ICONS[item.categoryId] || "/icons/default.png";

                return (
                  <button
                    key={item.linkerId}
                    onClick={() => {
                      console.log(`검색 리스트 클릭: ${item.name} (링커 ID: ${item.linkerId})`);
                      onItemClick({ linkerId: item.linkerId, lat: item.lat, lng: item.lng });
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
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 빈 상태 */}
            {linkers.length === 0 && (
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

export default LinkerListModal;
