// src/components/chat/BackChatProfileHeader.tsx
import { ChevronLeft, EllipsisVertical, X } from "lucide-react";
import type { RoomResponseDTO } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { roomBackgroundUrl } from "@/utils/chat";

const COLOR_ICON_NAME: Record<number, string> = {
  1: "red.png",
  2: "orange.png",
  3: "yellow.png",
  4: "green.png",
  5: "blue.png",
  6: "purple.png",
};

const asset = (p: string) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const path = p.replace(/^\/+/, "");
  return `${base}/${path}`;
};

export type BackChatHeaderDMOverride = {
  dmName?: string | null;   // 위: 이름
  dmNick?: string | null;   // 아래: 닉네임(태그)
  dmUserId?: number | null; // 프로필 사진 계산용
};

function readGender(room: any): string | undefined {
  return (
    room?.dmPartnerGender ??
    room?.friendGender ??
    room?.partnerGender ??
    room?.dmPartner?.gender ??
    undefined
  );
}

function genderFallbackSrc(g?: string | null) {
  if (g === "남성") return asset("icons/profile/Man.png");
  if (g === "여성") return asset("icons/profile/Woman.png");
  return asset("icons/profile/Default.png");
}

/** 동일 출처의 /api/* 인지 판단 (blob 재시도 조건) */
function isSameOriginApi(url: string | undefined) {
  if (!url) return false;
  try {
    if (url.startsWith("/")) return url.startsWith("/api/");
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin && u.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

export default function BackChatProfileHeader({
  room,
  backTo = "/chat",
  onMenuClick,
  menuOpen = false,
  dmName,
  dmNick,
  dmUserId,
}: {
  room: RoomResponseDTO;
  backTo?: string;
  onMenuClick?: () => void;
  menuOpen?: boolean;
} & BackChatHeaderDMOverride) {
  const navigate = useNavigate();
  const isDM = room.roomType === "DM";

  // DM일 때 partnerId / partnerName / partnerNickname 우선
  const partnerId = dmUserId ?? (room as any).dmPartnerId ?? (room as any).friendUserId ?? null;
  const partnerName = dmName ?? (room as any).dmPartnerName ?? (room as any).friendName ?? "(상대)";
  const partnerNick = dmNick ?? (room as any).dmPartnerNickname ?? (room as any).friendNickname ?? null;

  const title = isDM ? partnerName : (room.roomName ?? "(이름 없음)");
  const sub = isDM ? partnerNick : null;

  // 아바타 후보 구성
  const candidates = useMemo(() => {
    if (isDM) {
      const arr: (string | undefined)[] = [];
      const partnerImg = (room as any).dmPartnerProfileImageUrl as string | undefined;

      // 1) partnerId 기반 공개 뷰 엔드포인트
      if (typeof partnerId === "number") arr.push(`/api/user/view/profile/${partnerId}`);

      // 2) 백에서 내려준 이미지 URL
      if (partnerImg) arr.push(partnerImg);
      if ((room as any).friendImage) arr.push((room as any).friendImage as string);

      // 3) 성별 기본 이미지
      arr.push(genderFallbackSrc(readGender(room as any)));

      return arr.filter(Boolean) as string[];
    }

    // 그룹/클래스: 배경 우선 → 테마 컬러 아이콘
    const bg = roomBackgroundUrl(room.roomId);
    const colorId = Number(room.themeColor);
    const colorName = COLOR_ICON_NAME[colorId as keyof typeof COLOR_ICON_NAME];
    const colorIcon = colorName ? asset(`icons/color/${colorName}`) : undefined;

    return [bg, colorIcon].filter(Boolean) as string[];
  }, [isDM, partnerId, room]);

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const avatarSrc = candidates[idx];

  // blob 재시도 상태 (모바일 쿠키 미부착 대응)
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const [triedAuthFetch, setTriedAuthFetch] = useState(false);

  // 마운트 후에만 버튼/아바타 렌더
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setIdx(0);
    setFailed(false);
    setBlobUrl(undefined);
    setTriedAuthFetch(false);
  }, [room, candidates.length]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const displaySrc = blobUrl ?? avatarSrc;

  const handleImgError = async () => {
    // 동일 출처 /api/* 이면 1회 쿠키 포함 fetch로 blob 재시도
    if (!triedAuthFetch && isSameOriginApi(avatarSrc)) {
      setTriedAuthFetch(true);
      try {
        const res = await fetch(avatarSrc!, { credentials: "include" });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          return; // 성공 시 종료
        }
      } catch {
        // ignore -> 다음 후보로 진행
      }
    }

    const next = idx + 1;
    if (next < candidates.length) setIdx(next);
    else setFailed(true);
  };

  return (
    <header className="select-none fixed top-0 w-full flex items-center justify-between bg-white border-b border-gray-200 py-3 px-3 z-50">
      {mounted && (
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100/60 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="w-7 h-7 text-black" strokeWidth={1.6} />
        </button>
      )}

      <div className="flex-1 flex items-center justify-start min-w-0 px-2">
        {mounted && !failed && displaySrc ? (
          <img
            src={displaySrc}
            alt={title}
            className="w-10 h-10 rounded-full object-cover mr-2"
            onError={handleImgError}
            decoding="async"
            draggable={false}
          />
        ) : (
          <img
            src={asset("icons/user-default.png")}
            className="w-10 h-10 rounded-full object-cover mr-2"
            alt="기본 사용자 아이콘"
          />
        )}

        <div className="max-w-[72%] leading-tight">
          <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
          {isDM && sub ? <div className="text-[11px] text-gray-500 truncate">@{sub}</div> : null}
        </div>
      </div>

      {mounted && (
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100/60 transition-colors"
          aria-label={menuOpen ? "닫기" : "메뉴"}
        >
          {menuOpen ? <X className="w-5 h-5 text-black" /> : <EllipsisVertical className="w-5 h-5 text-black" />}
        </button>
      )}
    </header>
  );
}
