import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LinkerCardItem from "../linker/LinkerCardItem";
import { CATEGORY_DATA } from "@/constants/categoryData";

interface Linker {
  linkerId: number;
  name: string;
  categoryId: number;
  memo?: string;
  chatRoomCount: number;
  postCount: number;
  state: string;
  address: string;
}

interface ParticipationTabProps {
  participations: Linker[];
}

function ParticipationTab({ participations }: ParticipationTabProps) {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!participations || participations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <img
          src="/icons/favicon/favicon.svg"
          alt="워터마크"
          className="w-24 h-24 opacity-20 mb-4"
        />
        <div className="text-center px-8">
          <p className="text-gray-400 text-base mb-2">링커에 참여하고</p>
          <p className="text-gray-400 text-base">나만의 추억을 기록해 보세요</p>
        </div>
      </div>
    );
  }

  // 삭제된 링커 맨 뒤로
  const sortedParticipations = [...participations].sort((a, b) => {
    if (a.state === "DELETED" && b.state !== "DELETED") return 1;
    if (a.state !== "DELETED" && b.state === "DELETED") return -1;
    return 0;
  });

  // 카테고리 필터 적용
  const filteredParticipations = selectedCategory
    ? sortedParticipations.filter((p) => p.categoryId === selectedCategory)
    : sortedParticipations;

  // 선택된 카테고리 이름 찾기
  const selectedCategoryName = selectedCategory
    ? CATEGORY_DATA.find((_, idx) => idx + 1 === selectedCategory)?.name
    : null;

  return (
    <div>
      {/* 상단 필터 영역 */}
      <div className="flex justify-between items-center px-3 mt-3">
        <div className="text-left text-sm font-medium text-gray-700">
          {selectedCategory
            ? `${filteredParticipations.length}개의 링커 참여함`
            : `${participations.length}개의 링커 참여함`}
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="px-3 py-0.5 bg-gray-100 rounded-md text-sm flex items-center gap-2 hover:bg-gray-200"
          >
            {selectedCategory
              ? CATEGORY_DATA.find((c, idx) => idx + 1 === selectedCategory)?.name
              : "전체"}
            <svg
              className={`w-4 h-4 transform transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {/* 전체 버튼 */}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${selectedCategory === null ? "font-semibold text-blue-500" : ""
                  }`}
              >
                전체
              </button>

              {/* 카테고리 목록 (13번 신한 제외) */}
              {CATEGORY_DATA.filter((_, idx) => idx !== 12).map((cat, idx) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(idx + 1); // categoryId는 1부터 시작한다고 가정
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${selectedCategory === idx + 1 ? "font-semibold text-blue-500" : ""
                    }`}
                >
                  <img src={cat.icon} alt={cat.name} className="w-4 h-4 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 참여한 링커 카드들 */}
      <div className="mt-3">
        {filteredParticipations.length > 0 ? (
          filteredParticipations.map((linker) => {
            const isDeleted = linker.state === "DELETED";
            return (
              <div
                key={linker.linkerId}
                className={isDeleted ? "cursor-default" : "cursor-pointer"}
                onClick={() => {
                  if (!isDeleted) {
                    navigate("/map", { state: { openLinkerId: linker.linkerId } });
                  }
                }}
              >
                <LinkerCardItem linker={linker} />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p>참여하지 않은 카테고리입니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipationTab;
