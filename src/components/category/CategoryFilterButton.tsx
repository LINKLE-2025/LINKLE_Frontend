import { useState } from "react";

interface Props {
  onOpen: () => void;
}

export default function CategoryFilterButton({ onOpen }: Props) {
  return (
    <div className='w-full bg-white shadow-sm px-4 py-2 flex justify-center border-b border-gray-200'>
      <button
        className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors'
        onClick={onOpen}
      >
        🏷️ 카테고리 필터 열기
      </button>
    </div>
  );
}
