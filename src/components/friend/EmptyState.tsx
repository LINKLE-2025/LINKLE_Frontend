import React from 'react';

function EmptyState() {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-8 opacity-30">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
      <div className="text-center px-8">
        <p className="text-gray-400 text-base mb-2">링커에 참여하여</p>
        <p className="text-gray-400 text-base">다양한 친구들을 만나보세요</p>
      </div>
    </div>
  );
}

export default EmptyState;
