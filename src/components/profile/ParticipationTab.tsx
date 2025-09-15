import React from "react";
import { useNavigate } from "react-router-dom";
import LinkerCardItem from "../linker/LinkerCardItem";

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
  // categories?: typeof CATEGORY_DATA; // 현재 사용되지 않음, 필요 시 주석 해제
}

function ParticipationTab({ participations }: ParticipationTabProps) {
  const navigate = useNavigate();

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

  const sortedParticipations = [...participations].sort((a, b) => {
    if (a.state === "DELETED" && b.state !== "DELETED") return 1;
    if (a.state !== "DELETED" && b.state === "DELETED") return -1;
    return 0;
  });

  return (
    <div>
      <div className="ml-3 mt-3 text-left text-sm font-medium text-gray-700">
        {participations.length}개의 링커 참여함
      </div>
      <div className="px-4 py-2 space-y-3">
        {sortedParticipations.map((linker) => {
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
        })}
      </div>
    </div>
  );
}

export default ParticipationTab;
