// src/components/chat/MessageItem.tsx
import { useState } from "react";
import type { MessageResponseDTO } from "@/types/chat";
import { formatTimeLabel } from "@/utils/chat";
import { getCurrentUserId } from "@/api/authApi";

const DEV_UID = await getCurrentUserId().catch(() => { });

export default function MessageItem({
  m,
  showAvatar,
  name,
  avatar,
  isFirstOfBlock,
  compactAfterSystem,
}: {
  m: MessageResponseDTO;
  showAvatar: boolean;
  name?: string | null;
  avatar?: string | null;
  isFirstOfBlock: boolean;
  compactAfterSystem?: boolean;
}) {
  const isMine = m.senderId === DEV_UID;
  const [imgFailed, setImgFailed] = useState(false);

  const renderAvatar = () => {
    if (isMine) return null; // 내 메시지는 아바타 없음
    if (!showAvatar) return <div className="w-11 h-px flex-shrink-0" />; // 정렬용 스페이서

    if (avatar && !imgFailed) {
      return (
        <img
          src={avatar}
          alt={name ?? ""}
          className="w-11 h-11 bg-white shadow-sm rounded-full object-cover flex-shrink-0 mt-0.5"
          onError={() => setImgFailed(true)}
        />
      );
    }
    return <div className="w-11 h-11 shadow-sm rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />;
  };

  // 간격 규칙
  // - 시스템 메시지 직후면 가장 촘촘하게
  // - 같은 발신자 연속이면 약간 촘촘
  // - 블록 첫 메시지면 넉넉하게
  const outerMarginTop = compactAfterSystem
    ? "mt-1" // 시스템 직후
    : isFirstOfBlock
      ? "mt-5" // 새 블록 시작
      : "mt-1.5"; // 같은 발신자 연속

  // 시스템 직후엔 아래쪽도 살짝 줄여줌
  const outerMarginBottom = compactAfterSystem ? "mb-1.5" : "mb-2.5";

  return (
    <div className={`${outerMarginTop} ${outerMarginBottom}`} data-after-system={compactAfterSystem ? "1" : "0"}>
      <div className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
        {renderAvatar()}

        <div className="max-w-[72%]">
          {/* 첫 메시지에서만 이름 노출 */}
          {!isMine && showAvatar && (
            <div className="text-[12px] text-gray-600 mb-1 ml-1 text-left">{name ?? "탈퇴한 사용자"}</div>
          )}

          {isMine ? (
            <div className="flex items-end gap-1.5">
              <div className="text-[11px] text-gray-500 mb-0.5 whitespace-nowrap">
                {formatTimeLabel(m.createdDate)}
              </div>
              <div className="inline-block px-3 py-2 rounded-2xl bg-[#f5f5f5] border border-gray-300 shadow-sm whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              <div className="inline-block px-3 py-2 rounded-2xl bg-white border border-gray-300 shadow-sm whitespace-pre-wrap break-words">
                {m.content}
              </div>
              <div className="text-[11px] text-gray-500 mb-0.5 whitespace-nowrap">
                {formatTimeLabel(m.createdDate)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
