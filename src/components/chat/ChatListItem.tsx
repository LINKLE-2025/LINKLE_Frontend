import React, { useMemo, useState } from "react";
import type { RoomResponseDTO } from "@/types/chat";
import { formatTimeLabel, userProfileUrl, roomBackgroundUrl } from "@/utils/chat";

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const p = n.split(/\s+/);
  return p.length === 1 ? p[0]!.slice(0, 2) : `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`;
}

// participants에서 상대 id 추론 (필요 시)
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
  const title = rawTitle && String(rawTitle).trim().length > 0 ? rawTitle : "(이름 없음)";

  const preview =
    (item as any).lastMessagePreview ?? (item as any).lastMessage ?? "대화를 시작해 보세요";

  // 시간 포맷 적용
  const rawWhen = (item as any).lastMessageDate ?? (item as any).lastMessageAt ?? "";
  const when = formatTimeLabel(rawWhen);

  const partnerId = useMemo(
    () => (isDM ? extractPartnerId(item, currentUserId) : undefined),
    [isDM, item, currentUserId],
  );
  const avatarSrc = isDM ? userProfileUrl(partnerId) : roomBackgroundUrl((item as any).roomId);

  const [avatarError, setAvatarError] = useState(false);

  return (
    <button
      onClick={onClick}
      className='w-full text-left px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition flex items-center gap-3'
    >
      {/* 아바타 / 폴백 */}
      {!avatarError && avatarSrc ? (
        <img
          src={avatarSrc}
          alt={title}
          className='w-11 h-11 rounded-full object-cover'
          decoding='async'
          draggable={false}
          referrerPolicy='no-referrer'
          onError={() => setAvatarError(true)}
        />
      ) : (
        <div className='w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700'>
          {initials(title)}
        </div>
      )}

      {/* 텍스트 */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <span className='font-medium text-gray-900 truncate'>{title}</span>
          <span className='text-xs text-gray-400 shrink-0'>{when}</span>
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
