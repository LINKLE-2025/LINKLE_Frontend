// src/components/chat/MessageItem.tsx
import { useEffect, useMemo, useState } from "react";
import type { MessageResponseDTO } from "@/types/chat";
import { formatTimeLabel } from "@/utils/chat";
import { getCurrentUserId } from "@/api/authApi";

const DEV_UID = await getCurrentUserId().catch(() => { });

// public/ 에 있는 기본 이미지 사용
function genderFallbackSrc(gender?: string | null) {
  if (gender === "남성") return "/icons/profile/Man.png";
  if (gender === "여성") return "/icons/profile/Woman.png";
  return "/icons/profile/Default.png";
}

export default function MessageItem({
  m,
  showAvatar,
  name,
  avatar,
  gender,
  withdrawn,
  isFirstOfBlock,
  compactAfterSystem,
}: {
  m: MessageResponseDTO;
  showAvatar: boolean;
  name?: string | null;
  avatar?: string | null;
  gender?: string | null;
  withdrawn?: boolean;
  isFirstOfBlock: boolean;
  compactAfterSystem?: boolean;
}) {
  const isMine = m.senderId === DEV_UID;

  // 후보: 1) avatar → 2) (탈퇴 아님) 성별 폴백
  const candidates = useMemo(() => {
    if (isMine || !showAvatar) return [] as string[];
    const arr: (string | undefined)[] = [];
    if (avatar) arr.push(avatar);
    if (!withdrawn) arr.push(genderFallbackSrc(gender));
    return arr.filter(Boolean) as string[];
  }, [isMine, showAvatar, avatar, gender, withdrawn]);

  const [idx, setIdx] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const currentSrc = candidates[idx];

  useEffect(() => {
    setIdx(0);
    setAvatarError(false);
  }, [candidates.length, avatar, gender, withdrawn]);

  const renderAvatar = () => {
    if (isMine) return null;
    if (!showAvatar) return <div className="w-11 h-px flex-shrink-0" />;

    if (!avatarError && currentSrc) {
      return (
        <img
          src={currentSrc}
          alt={name ?? ""}
          className="w-11 h-11 bg-white shadow-sm rounded-full object-cover flex-shrink-0 mt-0.5"
          onError={() => {
            const next = idx + 1;
            if (next < candidates.length) setIdx(next);
            else setAvatarError(true);
          }}
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
        />
      );
    }
    return <div className="w-11 h-11 shadow-sm rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />;
  };

  const outerMarginTop = compactAfterSystem ? "mt-1" : isFirstOfBlock ? "mt-5" : "mt-1.5";
  const outerMarginBottom = compactAfterSystem ? "mb-1.5" : "mb-2.5";

  return (
    <div className={`${outerMarginTop} ${outerMarginBottom}`} data-after-system={compactAfterSystem ? "1" : "0"}>
      <div className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
        {renderAvatar()}

        <div className="max-w-[72%]">
          {!isMine && showAvatar && (
            <div className="text-[12px] text-gray-600 mb-1 ml-1 text-left">
              {name ?? (withdrawn ? "탈퇴한 사용자" : "알 수 없음")}
            </div>
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
