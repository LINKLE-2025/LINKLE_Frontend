// src/components/profile/StateTab.tsx
import React from "react";

interface StateTabProps {
  linkerStats: { categoryId: number; count: number }[];
  activities: string[];
  icons: string[];
  colors?: string[];
}

function StateTab({ linkerStats, activities, icons }: StateTabProps) {
  if (!linkerStats || linkerStats.length === 0) {
    return (<div className="flex-1 flex flex-col items-center justify-center py-20">
      <img
        src='/icons/favicon/favicon.svg' // 🔹 워터마크 이미지 경로
        alt='워터마크'
        className='w-24 h-24 opacity-20 mb-4' // 크기, 투명도, 아래 여백
      />
      <div className="text-center px-8">
        <p className="text-gray-400 text-base mb-2">링커에 참여하고</p>
        <p className="text-gray-400 text-base">나만의 추억을 기록해 보세요</p>
      </div>
    </div>)
  }

  return (
    <div className="p-4 space-y-3">
      {linkerStats.map((state) => {
        const activityName = activities[state.categoryId - 1] ?? "기타";
        const iconSrc = icons[state.categoryId - 1] ?? "/icons/category/default.png";

        return (
          <div
            key={state.categoryId}
            className="flex items-center p-3 border rounded-lg bg-white shadow-sm"
          >
            {/* 카테고리 아이콘 */}
            <div className="w-10 h-10 flex items-center justify-center mr-3 bg-gray-100 rounded-full">
              <img src={iconSrc} alt={activityName} className="w-7 h-7" />
            </div>

            {/* 카테고리 이름 + 횟수 */}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{activityName}</h3>
              <p className="text-sm text-gray-500">{state.count}회 참여</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StateTab;
