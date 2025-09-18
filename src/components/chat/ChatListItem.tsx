import React, { useMemo, useState, useEffect } from "react";
import type { RoomResponseDTO } from "@/types/chat";
import { formatTimeLabel } from "@/utils/chat";

// 정적 에셋용 BASE_URL 안전 절대경로
const asset = (p: string) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const path = p.replace(/^\/+/, "");
  return `${base}/${path}`;
};

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const p = n.split(/\s+/);
  return p.length === 1 ? p[0]!.slice(0, 2) : `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`;
}

// participants에서 상대 id 추론
function partnerFromArray(arr: any[] | undefined, me?: number) {
  if (!arr?.length) return undefined;
  const ids = arr
    .map((p) => p?.userId ?? p?.id ?? p?.user?.id ?? p?.member?.userId ?? p?.member?.id)
    .filter((v: any) => typeof v === "number") as number[];
  if (!ids.length) return undefined;
  return typeof me === "number" ? (ids.find((x) => x !== me) ?? ids[0]) : ids[0];
}
function extractPartnerId(item: any, me?: number) {
  if (typeof item?.dmPartnerId === "number") return item.dmPartnerId;
  if (typeof item?.dmPartner?.userId === "number") return item.dmPartner.userId;
  return (
    partnerFromArray(item?.participants, me) ??
    partnerFromArray(item?.members, me) ??
    partnerFromArray(item?.users, me)
  );
}

// 1~6 → 아이콘 파일명 매핑
const COLOR_ICON_NAME: Record<number, string> = {
  1: "red.png",
  2: "orange.png",
  3: "yellow.png",
  4: "green.png",
  5: "blue.png",
  6: "purple.png",
};

// 탈퇴/성별 판별
function isWithdrawn(item: any) {
  const s =
    (item?.dmPartnerState ??
      item?.dmPartner?.state ??
      item?.partnerState ??
      item?.state ??
      item?.dmPartner?.status ??
      item?.status ??
      "") as string;

  const v = s.toString().trim().toUpperCase();
  return v === "DELETED" || v === "WITHDRAWN" || v === "INACTIVE";
}
function readGender(item: any): string | undefined {
  return (
    item?.dmPartnerGender ??
    item?.dmPartner?.gender ??
    item?.partnerGender ??
    item?.gender ??
    undefined
  );
}
function genderFallbackSrc(gender?: string) {
  if (gender === "남성") return asset("icons/profile/Man.png");
  if (gender === "여성") return asset("icons/profile/Woman.png");
  return asset("icons/profile/Default.png");
}

export default function ChatListItem({
  item,
  onClick,
  currentUserId,
}: {
  item: RoomResponseDTO;
  onClick: () => void;
  currentUserId?: number;
}) {
  const roomType = String((item as any).roomType ?? "").toUpperCase();
  const isDM = roomType === "DM" || roomType === "DIRECT";

  const rawTitle =
    (isDM ? (item as any).dmPartnerName : undefined) ??
    (item as any).friendName ??
    (item as any).roomName;

  const withdrawn = isDM && isWithdrawn(item);
  const title =
    withdrawn
      ? "탈퇴한 사용자"
      : rawTitle && String(rawTitle).trim().length > 0
        ? rawTitle
        : "(이름 없음)";

  const preview =
    (item as any).lastMessagePreview ?? (item as any).lastMessage ?? "대화를 시작해 보세요";

  const rawWhen = (item as any).lastMessageDate ?? (item as any).lastMessageAt ?? "";
  const when = formatTimeLabel(rawWhen);

  const partnerId = useMemo(
    () => (isDM ? extractPartnerId(item, currentUserId) : undefined),
    [isDM, item, currentUserId],
  );

  const colorIdRaw = (item as any).themeColor;
  const colorId = typeof colorIdRaw === "string" ? Number(colorIdRaw) : colorIdRaw;
  const colorIconName = COLOR_ICON_NAME[colorId as number];
  const colorIconSrc = colorIconName ? asset(`icons/color/${colorIconName}`) : undefined;

  // --- 이미지 후보 구성 (절대경로 /api 사용) ---
  const gender = readGender(item);
  const candidates = useMemo(() => {
    if (isDM) {
      const arr: (string | undefined)[] = [];
      if (typeof partnerId === "number") {
        // 공개 뷰 엔드포인트 가정
        arr.push(`/api/user/view/profile/${partnerId}`);
      }
      if (!withdrawn) {
        arr.push(genderFallbackSrc(gender));
      }
      return arr.filter(Boolean) as string[];
    } else {
      // 그룹: 배경 우선 → 색아이콘
      const bg = `/api/chat/view/background/${(item as any).roomId}`;
      return [bg, colorIconSrc].filter(Boolean) as string[];
    }
  }, [isDM, partnerId, withdrawn, gender, colorIconSrc, item]);

  // 후보를 순서대로 시도
  const [idx, setIdx] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const avatarSrc = candidates[idx];

  useEffect(() => {
    setIdx(0);
    setAvatarError(false);
  }, [item, candidates.length]);

  const unread = Math.max(0, Number((item as any).unreadCount ?? 0));

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition flex items-center gap-3"
    >
      {/* 아바타 / 폴백 */}
      {!avatarError && avatarSrc ? (
        <img
          src={avatarSrc}
          alt={title}
          className="w-11 h-11 rounded-full object-cover"
          decoding="async"
          draggable={false}
          onError={() => {
            const next = idx + 1;
            if (next < candidates.length) setIdx(next);
            else setAvatarError(true);
          }}
        />
      ) : (
        <img
          src={asset("icons/user-default.png")}
          alt="기본 사용자 아이콘"
          className="w-11 h-11 rounded-full"
        />
      )}

      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 truncate">{title}</span>
          <span className="text-xs text-gray-400 shrink-0">{when}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs xs:text-sm text-gray-500 truncate">{preview}</p>

          {unread > 0 && (
            <span
              className="ml-2 shrink-0 inline-flex items-center gap-1.5"
              aria-label={`안 읽은 메시지 ${unread}개`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-400 tabular-nums">
                {unread > 99 ? "99+" : unread}
              </span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
