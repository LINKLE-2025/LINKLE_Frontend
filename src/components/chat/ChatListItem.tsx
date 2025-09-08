import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import type { RoomResponseDTO } from "@/services/chat";

// ===== helpers =====
function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const p = n.split(/\s+/);
  return p.length === 1 ? p[0]!.slice(0, 2) : `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`;
}
const profileUrl = (userId?: number | null) => (userId ? `/api/user/view/profile/${userId}` : "");
const roomBackgroundUrl = (roomId?: number | null) =>
  roomId ? `/api/chat/view/background/${roomId}` : "";

// participants/members/users 등에서 상대 id 추론
function partnerFromArray(arr: any[] | undefined, me?: number) {
  if (!arr?.length) return undefined;
  const ids = arr
    .map((p) => p?.userId ?? p?.id ?? p?.user?.id ?? p?.member?.userId ?? p?.member?.id)
    .filter((v: any) => typeof v === "number") as number[];
  if (!ids.length) return undefined;
  return typeof me === "number" ? (ids.find((x) => x !== me) ?? ids[0]) : ids[0];
}

// 최대한 많은 후보에서 partnerId 추출
function extractPartnerId(item: any, me?: number) {
  const direct = item?.dmPartnerId;
  if (typeof direct === "number") return direct;

  const nested = item?.dmPartner?.userId;
  if (typeof nested === "number") return nested;

  return (
    partnerFromArray(item?.participants, me) ??
    partnerFromArray(item?.members, me) ??
    partnerFromArray(item?.users, me)
  );
}

// ===== component =====
export default function ChatListItem({
  item,
  onClick,
  currentUserId, // 옵션: 내 userId
}: {
  item: RoomResponseDTO;
  onClick: () => void;
  currentUserId?: number;
}) {
  // roomType(enum) → 문자열 비교 안전화
  const roomType = String((item as any).roomType ?? "").toUpperCase();
  const isDM = roomType === "DM" || roomType === "DIRECT";

  // 제목/미리보기/시간
  const rawTitle =
    (isDM ? (item as any).dmPartnerName : undefined) ??
    (item as any).friendName ??
    (item as any).roomName;
  const title = rawTitle && String(rawTitle).trim().length > 0 ? rawTitle : "(이름 없음)";

  const preview =
    (item as any).lastMessagePreview ?? (item as any).lastMessage ?? "대화를 시작해 보세요";
  const when = (item as any).lastMessageDate ?? (item as any).lastMessageAt ?? null;

  // 아바타/배경 URL
  const partnerId = useMemo(
    () => (isDM ? extractPartnerId(item, currentUserId) : undefined),
    [isDM, item, currentUserId],
  );

  const avatarSrc = useMemo(() => {
    if (isDM && partnerId) return profileUrl(partnerId);
    if (!isDM && item.roomId) return roomBackgroundUrl(item.roomId);
    return "";
  }, [isDM, partnerId, item.roomId]);

  return (
    <button
      onClick={onClick}
      className='w-full text-left px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition flex items-center gap-3'
    >
      {/* 아바타 / 이니셜 */}
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={title}
          className='w-11 h-11 rounded-full object-cover'
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.insertAdjacentHTML(
              "afterend",
              '<svg xmlns="http://www.w3.org/2000/svg" class="w-11 h-11 text-gray-500 rounded-full bg-gray-200 p-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.953 9.953 0 0112 15c2.485 0 4.735.896 6.879 2.804M15 11a3 3 0 11-6 0 3 3 0 6 0z" /></svg>',
            );
          }}
        />
      ) : (
        <div className='w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700'>
          {initials(title)}
        </div>
      )}

      {/* 텍스트 */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <Link
            to='#'
            onClick={(e) => e.preventDefault()}
            className='font-medium text-gray-900 truncate'
          >
            {title}
          </Link>
          <span className='text-xs text-gray-400 shrink-0'>{when ?? ""}</span>
        </div>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-sm text-gray-500 truncate'>{preview}</p>
          {item.unreadCount && item.unreadCount > 0 && (
            <span className='ml-2 shrink-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5'>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
