import React from 'react';

interface EmptyStateProps {
  footerHeight?: number;
}

function EmptyState({ footerHeight = 0 }: EmptyStateProps) {
  return (
    <div
      className="flex-1 bg-linkleGray-50 flex flex-col items-center justify-center"
      style={{ marginBottom: footerHeight }}
    >
      <div className="flex flex-col items-center text-gray-300">
        <img
          src="/icons/favicon/favicon.svg"
          alt="검색 없음"
          className="w-44 h-44 xxs:w-56 xxs:h-56 opacity-10 mb-4"
        />
        <p className="text-center text-xl xxs:text-[23px]">링커에 참여하여</p>
        <p className="text-linkleGray-400 text-base">다양한 친구들을 만나보세요</p>
      </div>
    </div>
  );
}

export default EmptyState;
