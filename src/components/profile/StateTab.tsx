import { CATEGORY_DATA } from "@/constants/categoryData"; // 혹시 몰라 import 추가
import { Star, Trophy } from "lucide-react";

interface StateTabProps {
  linkerStats: {
    categoryId: number;
    linkerCount: number;
    postCount: number;
    chatCount: number;
  }[];
  categories: typeof CATEGORY_DATA;
}

function addRanks(data: StateTabProps["linkerStats"]) {
  // 1. categoryId=13 분리
  const special = data.find((item) => item.categoryId === 13);
  const others = data.filter((item) => item.categoryId !== 13);

  // 2. 나머지 정렬: linkerCount 내림차순
  const sorted = [...others].sort((a, b) => b.linkerCount - a.linkerCount);

  let rank = 0;
  let prevCount: number | null = null;
  const rankMap: Record<number, number> = {};

  sorted.forEach((item, index) => {
    if (item.linkerCount !== prevCount) {
      rank = index + 1; // 1등부터 시작
    }
    rankMap[item.categoryId] = rank;
    prevCount = item.linkerCount;
  });

  // 3. 순위 적용
  const rankedOthers = sorted.map((item) => ({
    ...item,
    rank: rankMap[item.categoryId],
  }));

  // 4. special(13)은 맨 위에 rank=0으로 추가
  const rankedSpecial = special
    ? [{ ...special, rank: 0 }, ...rankedOthers]
    : rankedOthers;

  return rankedSpecial;
}

function StateTab({ linkerStats, categories }: StateTabProps) {
  if (!linkerStats || linkerStats.length === 0) {
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

  const rankedStats = addRanks(linkerStats);

  return (
    <div className="p-4 space-y-2">
      {rankedStats.map((state) => {
        const category =
          state.categoryId >= 1 && state.categoryId <= categories.length
            ? categories[state.categoryId - 1]
            : null;

        const activityName = category?.title ?? "기타";
        const iconSrc = category?.icon ?? "/icons/category/default.png";
        const color = category?.color ?? "#ccc";

        return (
          <div
            key={state.categoryId}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${color}10` }}
          >
            {/* 왼쪽: 순위 + 카테고리 정보 */}
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-700 mr-4">
                {state.rank === 0 ?
                  <Star className="w-6 h-6 text-blue-600 fill-blue-600" />
                  : state.rank}
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {activityName}
                  </h3>
                  {state.rank === 1 && <span className="ml-2">🥇</span>}
                  {state.rank === 2 && <span className="ml-2">🥈</span>}
                  {state.rank === 3 && <span className="ml-2">🥉</span>}
                </div>
                <p className="text-sm text-gray-500">
                  {state.postCount} 포스트  {state.chatCount} 채팅방 참여
                </p>
              </div>
            </div>

            {/* 오른쪽: 횟수 + 아이콘 */}
            <div className="flex items-center">
              <div
                className="w-24 h-12 flex items-center justify-center rounded-sm"
                style={{ backgroundColor: `${color}20` }}
              >
                <span className="text-lg font-bold text-gray-700 mr-3">
                  {state.linkerCount}회
                </span>

                <img src={iconSrc} alt={activityName} className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 🔥 여기 default export 추가
export default StateTab;
