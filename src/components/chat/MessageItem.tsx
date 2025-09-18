// src/components/chat/MessageItem.tsx
import { useEffect, useMemo, useState } from "react";
import type { MessageResponseDTO } from "@/types/chat";
import { getCurrentUserId } from "@/api/authApi";

const DEV_UID = await getCurrentUserId().catch(() => { });

// public/ 에 있는 기본 이미지
function genderFallbackSrc(gender?: string | null) {
  if (gender === "남성") return "/icons/profile/Man.png";
  if (gender === "여성") return "/icons/profile/Woman.png";
  return "/icons/profile/Default.png";
}

/** "오전 5:01" */
function formatTimeAmPmKR(input: string | number | Date) {
  const d = new Date(input);
  const h24 = d.getHours();
  const m = d.getMinutes();
  const ampm = h24 < 12 ? "오전" : "오후";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const mm = String(m).padStart(2, "0");
  return `${ampm} ${h12}:${mm}`;
}

/** 동일 출처의 /api/* 인지 판단 (blob 재시도 조건) */
function isSameOriginApi(url: string) {
  try {
    if (url.startsWith("/")) {
      // 같은 출처 상대경로
      return url.startsWith("/api/");
    }
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin && u.pathname.startsWith("/api/");
  } catch {
    return false;
  }
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

  // 후보: 1) 넘어온 avatar → 2) 발신자 프로필 뷰 → 3) 성별 기본 이미지
  const candidates = useMemo(() => {
    if (isMine || !showAvatar) return [] as string[];
    const arr: (string | undefined)[] = [];
    if (avatar) arr.push(avatar);
    if (typeof m.senderId === "number") {
      arr.push(`/api/user/view/profile/${m.senderId}`);
    }
    if (!withdrawn) arr.push(genderFallbackSrc(gender));
    return arr.filter(Boolean) as string[];
  }, [isMine, showAvatar, avatar, gender, withdrawn, m.senderId]);

  const [idx, setIdx] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const currentSrc = candidates[idx];

  // blob 재시도 상태
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const [triedAuthFetch, setTriedAuthFetch] = useState(false);

  useEffect(() => {
    setIdx(0);
    setAvatarError(false);
    setBlobUrl(undefined);
    setTriedAuthFetch(false);
  }, [candidates.length, avatar, gender, withdrawn, m.senderId]);

  const handleImgError = async () => {
    // 동일 출처 /api/* 이면 1회 쿠키 포함 fetch로 blob 재시도 (모바일 쿠키 미부착 대응)
    if (!triedAuthFetch && typeof currentSrc === "string" && isSameOriginApi(currentSrc)) {
      setTriedAuthFetch(true);
      try {
        const res = await fetch(currentSrc, { credentials: "include" });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          return; // 성공 시 여기서 종료 (img가 blobUrl로 다시 그림)
        }
      } catch {
        // ignore → 다음 후보로
      }
    }

    // 다음 후보로 이동
    const next = idx + 1;
    if (next < candidates.length) setIdx(next);
    else setAvatarError(true);
  };

  useEffect(() => {
    // unmount/변경 시 blob URL 정리
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const outerMarginTop = compactAfterSystem ? "mt-1" : isFirstOfBlock ? "mt-5" : "mt-1.5";
  const outerMarginBottom = compactAfterSystem ? "mb-1.5" : "mb-2.5";

  // 표시 src: blob 성공 > 현재 후보
  const displaySrc = blobUrl ?? currentSrc;

  const renderAvatar = () => {
    if (isMine) return null;
    if (!showAvatar) return <div className="w-8 h-8 xxs:w-11 xxs:h-11 flex-shrink-0" />;

    if (!avatarError && displaySrc) {
      return (
        <img
          src={displaySrc}
          alt={name ?? ""}
          className="w-8 h-8 xxs:w-11 xxs:h-11 bg-white shadow-sm rounded-full object-cover flex-shrink-0 mt-0.5"
          onError={handleImgError}
          decoding="async"
          draggable={false}
        />
      );
    }
    return <div className="w-8 h-8 xxs:w-11 xxs:h-11 shadow-sm rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className={`${outerMarginTop} ${outerMarginBottom}`} data-after-system={compactAfterSystem ? "1" : "0"}>
      <div className={`flex items-start gap-1 xxs:gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
        {renderAvatar()}

        <div className="max-w-[72%]">
          {!isMine && showAvatar && (
            <div className="text-[12px] text-gray-600 mb-0.5 ml-0.5 xxs:ml-1 xxs:mb-1 text-left">
              {name ?? (withdrawn ? "탈퇴한 사용자" : "알 수 없음")}
            </div>
          )}

          {isMine ? (
            <div className="flex items-end gap-1.5">
              <div className="text-[11px] text-gray-500 mb-0.5 whitespace-nowrap">
                {formatTimeAmPmKR(m.createdDate)}
              </div>
              <div className="inline-block px-[11px] py-1.5 xxs:px-3 xxs:py-2 text-sm xxs:text-base rounded-xl xxs:rounded-2xl bg-[#f5f5f5] border border-gray-300 shadow-sm whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              <div className="inline-block px-[11px] py-1.5 xxs:px-3 xxs:py-2 text-sm xxs:text-base rounded-xl xxs:rounded-2xl bg-white border border-gray-300 shadow-sm whitespace-pre-wrap break-words">
                {m.content}
              </div>
              <div className="text-[9px] xxs:text-[11px] text-gray-500 mb-0.5 whitespace-nowrap">
                {formatTimeAmPmKR(m.createdDate)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
