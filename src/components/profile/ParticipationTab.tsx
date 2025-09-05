import React from "react";

// UserParticipateLinkerDTO 타입 정의
interface UserParticipateLinkerDTO {
  linkerId: number;
  name: string;
  participatedDate: string;
  memo: string;
  linkerState: string;
}

// ParticipationTab 컴포넌트 props 타입 정의
// Props는 타입을 명확하게 정의하기 위해서 인터페이스로 작성한다.
// 이는 선언된 타입 이외의 다른 타입이 들어오면, 오류 메시지를 보여준다.
interface ParticipationTabProps {
  participations: UserParticipateLinkerDTO[];
}

// 링커 참여 내역을 리스트로 보여줌 
const ParticipationTab: React.FC<ParticipationTabProps> = ({ participations }) => {
  // 참여한 링커가 없을 경우 참여한 링커가 없다는 것을 메시지로 보여줌
  if (!participations || participations.length === 0) {
    return <p className="text-gray-500 text-center py-6">참여한 링커가 없습니다.</p>;
  }

  return (
    // 각 참여한 링커 정보를 카드 형태로 보여줌
    <div className="px-4 py-2 space-y-3">
      {participations.map((linker) => (
        <div
          key={linker.linkerId}
          className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-200"
        >
          {/* 링커 이미지 (임시 아이콘 or 추후 MinIO 이미지) */}
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
            <span className="text-2xl">🍲</span>
          </div>

          {/* 링커 정보 */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{linker.name}</h3>
            <p className="text-sm text-gray-500">
              참여일: {linker.participatedDate} | 상태: {linker.linkerState}
            </p>
            <p className="text-xs text-gray-400">{linker.memo}</p>
          </div>

          {/* 우측 통계 (예: 채팅방 수, 포스트 수 → 추후 서버에서 내려주면 교체 가능) */}
          <div className="text-right text-sm text-gray-500">
            <p>3 채팅방</p>
            <p>85 포스트</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipationTab;
  