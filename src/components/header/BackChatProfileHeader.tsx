// src/components/chat/BackChatProfileHeader.tsx
import { ChevronLeft, EllipsisVertical, X } from "lucide-react";
import type { RoomResponseDTO } from "@/types/chat";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
// ✅ roomBackgroundUrl 대신, 리스트/모달과 동일한 /api 경로를 직접 사용

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

/** 동일 출처 판정 (blob 재시도/사전가져오기 허용) */
function isSameOrigin(url: string | undefined) {
  if (!url) return false;
  try {
    const u = url.startsWith("/") ? new URL(url, window.location.origin) : new URL(url);
    return u.origin === window.location.origin && !u.protocol.startsWith("data") && !u.protocol.startsWith("blob");
  } catch {
    return false;
  }
}

/** 리스트/모달과 동일한 백그라운드 경로 */
function roomBgPath(roomId?: number | string | null) {
  if (roomId == null) return undefined;
  return `/api/chat/view/background/${roomId}`;
}

export default function BackChatProfileHeader({
  room,
  backTo = "/chat",
  onMenuClick,
  menuOpen = false,
  dmName,
  dmNick,
  dmUserId,
  linkerId,
}: {
  room: RoomResponseDTO;
  backTo?: string;
  onMenuClick?: () => void;
  menuOpen?: boolean;
  linkerId?: number | null;
} & BackChatHeaderDMOverride) {
  const navigate = useNavigate();
  const isDM = room.roomType === "DM";

  // DM일 때 partnerId / partnerName / partnerNickname 우선
  const partnerId = dmUserId ?? (room as any).dmPartnerId ?? (room as any).friendUserId ?? null;
  const partnerName = dmName ?? (room as any).dmPartnerName ?? (room as any).friendName ?? "(상대)";
  const partnerNick = dmNick ?? (room as any).dmPartnerNickname ?? (room as any).friendNickname ?? null;

  const title = isDM ? partnerName : (room.roomName ?? "(이름 없음)");
  const sub = isDM ? partnerNick : null;

  /** 후보 구성 (리스트/모달과 경로 일치) */
  const { candidates, bgUrlIndex } = useMemo(() => {
    if (isDM) {
      const arr: (string | undefined)[] = [];
      const partnerImg = (room as any).dmPartnerProfileImageUrl as string | undefined;

      // 1) partnerId 공개 뷰 (same-origin)
      if (typeof partnerId === "number") arr.push(`/api/user/view/profile/${partnerId}`);

      // 2) 서버 내려준 URL (cross-origin 포함)
      if (partnerImg) arr.push(partnerImg);
      if ((room as any).friendImage) arr.push((room as any).friendImage as string);

      // 3) 성별 기본 이미지 (public/)
      arr.push(genderFallbackSrc(readGender(room as any)));

      const list = arr.filter(Boolean) as string[];
      return { candidates: list, bgUrlIndex: -1 };
    }

    // 그룹/클래스: 컬러 아이콘 → 방 배경(/api/chat/view/background/:id) → (마지막) 기본 아이콘
    const colorId = Number((room as any).themeColor);
    const colorName = COLOR_ICON_NAME[colorId as keyof typeof COLOR_ICON_NAME];
    const colorIcon = colorName ? asset(`icons/color/${colorName}`) : undefined;

    const bg = roomBgPath((room as any).roomId); // ✅ 리스트/모달과 동일한 경로 사용
    const fallback = asset("icons/user-default.png");

    const list = [colorIcon, bg, fallback].filter(Boolean) as string[];
    const bgIndex = bg ? list.indexOf(bg) : -1;
    return { candidates: list, bgUrlIndex: bgIndex };
  }, [isDM, partnerId, room]);

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const currentSrc = candidates[idx];

  // blob 재시도/사전가져오기 상태
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const [triedAuthFetch, setTriedAuthFetch] = useState(false);
  const [prefetchedBg, setPrefetchedBg] = useState<string | undefined>(undefined); // bg 사전 로드 성공 URL

  // 마운트 후에만 버튼/아바타 렌더
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 후보/방 바뀔 때 상태 초기화
  useEffect(() => {
    setIdx(0);
    setFailed(false);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    if (prefetchedBg) URL.revokeObjectURL(prefetchedBg);
    setBlobUrl(undefined);
    setPrefetchedBg(undefined);
    setTriedAuthFetch(false);
  }, [room, candidates.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // 언마운트 정리
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (prefetchedBg) URL.revokeObjectURL(prefetchedBg);
    };
  }, [blobUrl, prefetchedBg]);

  // 표시 src: 사전가져온 bg > blob 재시도 > 현재 후보
  const displaySrc = prefetchedBg ?? blobUrl ?? currentSrc;

  /** 에러 시: same-origin이면 1회 쿠키 포함 fetch → blob로 교체 */
  const handleImgError = async () => {
    if (!triedAuthFetch && typeof currentSrc === "string" && isSameOrigin(currentSrc)) {
      setTriedAuthFetch(true);
      try {
        const res = await fetch(currentSrc, {
          credentials: "include",
          headers: { "Cache-Control": "no-store" },
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          return; // 성공
        }
      } catch {
        // ignore
      }
    }
    // 다음 후보
    const next = idx + 1;
    if (next < candidates.length) setIdx(next);
    else setFailed(true);
  };
  const location = useLocation();
  const from = location.state?.from;
  /**
   * 모바일 IMG 쿠키 미부착 대비:
   * 그룹/클래스이고, bg 후보가 있고, same-origin이면
   * 컬러 아이콘을 먼저 보여주면서 "사전 fetch"로 bg를 받아오고 성공 시 곧바로 교체.
   */
  useEffect(() => {
    const bgCandidate = bgUrlIndex >= 0 ? candidates[bgUrlIndex] : undefined;
    if (!isDM && bgCandidate && isSameOrigin(bgCandidate)) {
      let aborted = false;
      (async () => {
        try {
          const res = await fetch(bgCandidate, {
            credentials: "include",
            headers: { "Cache-Control": "no-store" },
          });
          if (!res.ok) return;
          const blob = await res.blob();
          if (aborted) return;
          const url = URL.createObjectURL(blob);
          setPrefetchedBg((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          // 배경이 준비되면 시각적으로 즉시 적용
          if (bgUrlIndex > -1) setIdx(bgUrlIndex);
        } catch {
          // 조용히 패스
        }
      })();
      return () => {
        aborted = true;
      };
    }
  }, [isDM, candidates, bgUrlIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className="select-none fixed top-0 w-full flex items-center justify-between bg-white border-b border-gray-200 py-3 px-3 z-50">
      {mounted && (
        <button
          onClick={() => {
            if (from === "/map") {
              console.log("채팅지도복귀: ", linkerId)
              navigate("/map", { state: { openLinkerId: linkerId } }); // /map이면 /map으로 이동
            } else {
              navigate(-1); // 그 외에는 이전 페이지로
              console.log("채팅뒤로가기");
            }
          }}
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
            // cross-origin일 때도 성공률 힌트
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        ) : (
          <img
            src={asset("icons/user-default.png")}
            className="w-10 h-10 rounded-full object-cover mr-2"
            alt="기본 사용자 아이콘"
            decoding="async"
            draggable={false}
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
