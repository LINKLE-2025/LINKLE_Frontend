// src/components/ui/CategoryFilterButton.tsx
import { Star } from "lucide-react";
import React from "react";

interface Props {
  onClick: () => void;
  isActive?: boolean; // 선택 상태 여부
}

const CategoryFilterButton: React.FC<Props> = ({ onClick, isActive = false }) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        className={`
          flex items-center justify-center
          px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-white shadow-sm
          hover:bg-gray-50 transition-all duration-200 gap-1.5
        `}
        onClick={onClick}
      >
        <Star className={`inline-block w-5 h-5 text-yellow-300 fill-yellow-300`} />
      </button>
    </div>
  );
};

export default CategoryFilterButton;
