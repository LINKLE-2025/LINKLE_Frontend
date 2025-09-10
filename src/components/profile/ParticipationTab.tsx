import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLinkerDetail } from "@/api/mapApi"; // ✅ 상세 조회 API

// UserParticipateLinkerDTO 타입 정의
interface UserParticipateLinkerDTO {
  linkerId: number;
  name: string;
  participatedDate: string;
  memo: string;
  state: string;
  categoryId?: number; // 카테고리 번호 (백엔드에서 내려옴)
}

interface ParticipationTabProps {
  participations: UserParticipateLinkerDTO[];
  activities: string[];
  icons: string[];
  colors?: string[];
}

function ParticipationTab({ participations, activities, icons, colors }: ParticipationTabProps) {
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<UserParticipateLinkerDTO | null>(null);

  const openDetailModal = async (linkerId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);

  };

  if (!participations || participations.length === 0) {
    return <p className="text-gray-500 text-center py-6">참여한 링커가 없습니다.</p>;
  }

  return (
    <div>
      <div className="ml-3 mt-3 text-left text-sm font-medium text-gray-700">
        {participations.length}개의 링커 참여함
      </div>
      <div className="px-4 py-2 space-y-3">
        {participations.map((linker) => {
          const activityName = linker.categoryId
            ? activities[linker.categoryId - 1] ?? "기타"
            : "기타";
          const iconSrc = linker.categoryId
            ? icons[linker.categoryId - 1] ?? "/icons/category/default.png"
            : "/icons/category/default.png";
          const colorSrc = linker.categoryId
            ? colors?.[linker.categoryId - 1] ?? "#FFAEAE"
            : "#FFAEAE";

          return (
            <div
              key={linker.linkerId}
              className="flex items-center p-4 rounded-2xl border cursor-pointer hover:shadow-md transition"
              style={{ backgroundColor: `${colorSrc}20` }}
              onClick={() => {
                if (linker.state === "DELETED") {
                  openDetailModal(linker.linkerId);
                } else {
                  navigate("/map", { state: { openLinkerId: linker.linkerId } });
                }
              }}
            >
              {/* 카테고리 아이콘 */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <img src={iconSrc} alt={activityName} className="w-8 h-8" />
              </div>

              {/* 링커 정보 */}
              <div className="flex-0">
                <h3 className="font-semibold text-gray-900">{linker.name}</h3>
                <p className="text-xs text-gray-400">{linker.memo}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ DELETED용 가벼운 모달 */}
      {detailOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-80 p-5">
            {detailLoading && <p className="text-gray-500">불러오는 중...</p>}
            {detailError && <p className="text-red-500">{detailError}</p>}
            {detailData && (
              <>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{detailData.name}</h2>
                <p className="text-sm text-gray-600">{detailData.memo || "메모 없음"}</p>
              </>
            )}
            <button
              className="mt-4 w-full bg-blue-500 text-white rounded-lg py-2 text-sm"
              onClick={() => setDetailOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipationTab;
