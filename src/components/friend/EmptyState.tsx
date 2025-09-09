import React from 'react';

function EmptyState() {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center py-20">
      <img
        src='/icons/favicon/favicon.svg' // 🔹 워터마크 이미지 경로
        alt='워터마크'
        className='w-24 h-24 opacity-20 mb-4' // 크기, 투명도, 아래 여백
      />
      <div className="text-center px-8">
        <p className="text-gray-400 text-base mb-2">링커에 참여하여</p>
        <p className="text-gray-400 text-base">다양한 친구들을 만나보세요</p>
      </div>
    </div>
  );
}

export default EmptyState;
