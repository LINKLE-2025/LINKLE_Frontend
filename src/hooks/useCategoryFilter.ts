// src/hooks/useCategoryFilter.ts
import { useState, useCallback } from "react";

// 커스텀 훅의 반환 타입 정의
interface UseCategoryFilterReturn {
  // 상태
  categoryFilterOpen: boolean;
  selectedCategories: Set<number>;

  // 상태 변경 함수들
  setCategoryFilterOpen: (open: boolean) => void;
  toggleCategoryFilter: (categoryId: number) => void;
  selectAllCategories: () => void;
  clearAllFilters: () => void;

  // 편의 정보
  selectedCount: number;
  hasSelection: boolean;
  isAllSelected: boolean;
}

// 모든 카테고리 ID 목록
const ALL_CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 카테고리 이름 매핑 (디버깅용)
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

/**
 * 카테고리 필터링 관련 상태와 로직을 관리하는 커스텀 훅
 * @param initialCategories - 초기 선택된 카테고리들 (기본값: 모든 카테고리 선택)
 */
export const useCategoryFilter = (initialCategories?: number[]): UseCategoryFilterReturn => {
  // ===== 내부 상태들 =====

  // 카테고리 필터 패널 열림/닫힘 상태
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);

  // 현재 선택된 카테고리들 (Set 사용으로 중복 방지 및 빠른 조회)
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(() => {
    // 초기값 설정: 전달받은 initialCategories 또는 모든 카테고리 선택
    const initial = initialCategories || ALL_CATEGORY_IDS;
    return new Set(initial);
  });

  // ===== 카테고리 조작 함수들 =====

  /**
   * 개별 카테고리를 선택/해제하는 토글 함수
   * @param categoryId - 토글할 카테고리 ID
   */
  const toggleCategoryFilter = useCallback((categoryId: number) => {
    const categoryName = CATEGORY_NAMES[categoryId] || `카테고리${categoryId}`;
    console.log(`카테고리 ${categoryId}(${categoryName}) 토글`);

    setSelectedCategories((prev) => {
      const newSet = new Set(prev); // 기존 Set을 복사 (불변성 유지)

      if (newSet.has(categoryId)) {
        // 이미 선택되어 있으면 제거
        newSet.delete(categoryId);
        console.log(`카테고리 ${categoryId}(${categoryName}) 제거됨`);
      } else {
        // 선택되어 있지 않으면 추가
        newSet.add(categoryId);
        console.log(`카테고리 ${categoryId}(${categoryName}) 추가됨`);
      }

      console.log("현재 선택된 카테고리들:", Array.from(newSet));
      return newSet;
    });
  }, []);

  /**
   * 모든 카테고리를 선택하는 함수
   */
  const selectAllCategories = useCallback(() => {
    console.log("모든 카테고리 선택");
    setSelectedCategories(new Set(ALL_CATEGORY_IDS));
  }, []);

  /**
   * 모든 카테고리 선택을 해제하는 함수
   */
  const clearAllFilters = useCallback(() => {
    console.log("모든 카테고리 필터 해제");
    setSelectedCategories(new Set());
  }, []);

  // ===== 계산된 값들 (편의성을 위한 추가 정보) =====

  // 선택된 카테고리 수
  const selectedCount = selectedCategories.size;

  // 선택된 카테고리가 하나라도 있는지 여부
  const hasSelection = selectedCount > 0;

  // 모든 카테고리가 선택되었는지 여부
  const isAllSelected = selectedCount === ALL_CATEGORY_IDS.length;

  // ===== 반환값 =====
  return {
    // 상태
    categoryFilterOpen,
    selectedCategories,

    // 상태 변경 함수들
    setCategoryFilterOpen,
    toggleCategoryFilter,
    selectAllCategories,
    clearAllFilters,

    // 편의 정보
    selectedCount,
    hasSelection,
    isAllSelected,
  };
};
