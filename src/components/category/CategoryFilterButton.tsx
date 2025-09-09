// src/components/ui/CategoryFilterButton.tsx
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
          px-4 py-2 rounded-lg border-2 border-gray-300 bg-white shadow-md
          transition-all duration-200
          ${isActive ? "text-yellow-500 shadow-lg" : "text-blue-500 hover:shadow-lg"}
          hover:bg-gray-100
        `}
        onClick={onClick}
      >
        ⭐
      </button>
    </div>
  );
};

export default CategoryFilterButton;
