interface StateTabProps {
  linkerStats: { categoryId: number; count: number }[];
}

const ACTIVITIES = [
  "식사",  // 1
  "카페",  // 2
  "음악",  // 3
  "영화",  // 4
  "독서",  // 5
  "운동",  // 6
  "음주",  // 7
  "학습",  // 8
  "쇼핑",  // 9
  "병원",  // 10
  "게임",  // 11
  "여행",  // 12
];

function StateTab({ linkerStats }: StateTabProps) {
  return (
    <div className="p-4 space-y-3">
      {linkerStats.map((state) => {
        const activityName = ACTIVITIES[state.categoryId - 1] ?? "기타";
        return (
          <div key={state.categoryId} className="border p-2 rounded">
            <h3 className="font-semibold">{activityName}</h3>
            <p>{state.count}회</p>
          </div>
        );
      })}

      {linkerStats.length === 0 && (
        <p className="text-gray-400 text-sm">참여 내역이 없습니다</p>
      )}
    </div>
  );
}

export default StateTab;
