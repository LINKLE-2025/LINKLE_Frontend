import { ChevronLeft, EllipsisVertical, X } from "lucide-react";
import type { RoomResponseDTO } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { userProfileUrl, roomBackgroundUrl } from "@/utils/chat";

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
  dmName?: string | null;      // 위: 이름
  dmNick?: string | null;      // 아래: 닉네임(태그)
  dmUserId?: number | null;    // 프로필 사진 계산용 폴백
};

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

  const title =
    isDM ? (dmName ?? room.friendName ?? "(상대)") : (room.roomName ?? "(이름 없음)");

  // 닉네임 표시는 DM에서만
  const sub = isDM
    ? (dmNick ?? (room as any).dmPartnerNickname ?? null)
    : null;

  const [avatarError, setAvatarError] = useState(false);
  const avatarSrc = useMemo(() => {
    if (isDM) {
      const partnerImg = (room as any).dmPartnerProfileImageUrl as string | undefined;
      if (dmUserId != null) return userProfileUrl(dmUserId);
      if (partnerImg) return partnerImg;
      if ((room as any).friendImage) return (room as any).friendImage as string;
      return userProfileUrl((room as any).friendUserId ?? null);
    }
    const colorId = Number(room.themeColor);
    const name = COLOR_ICON_NAME[colorId as keyof typeof COLOR_ICON_NAME];
    return name ? asset(`icons/color/${name}`) : roomBackgroundUrl(room.roomId);
  }, [isDM, dmUserId, room.friendUserId, room.themeColor, room.roomId]);

  return (
    <header className="fixed top-0 w-full flex items-center justify-between bg-white border-b border-gray-200 py-3 px-3 z-50">
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100/60 transition-colors"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="w-7 h-7 text-black" strokeWidth={1.6} />
      </button>

      <div className="flex-1 flex items-center justify-start min-w-0 px-2">
        {!avatarError && avatarSrc ? (
          <img
            src={avatarSrc}
            alt={title}
            className="w-10 h-10 rounded-full object-cover mr-2"
            onError={() => setAvatarError(true)}
            decoding="async"
            draggable={false}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
        )}

        <div className="max-w-[72%] leading-tight">
          <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
          {isDM && sub ? (
            <div className="text-[11px] text-gray-500 truncate">@{sub}</div>
          ) : null}
        </div>
      </div>

      <button
        onClick={onMenuClick}
        className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100/60 transition-colors"
        aria-label={menuOpen ? "닫기" : "메뉴"}
      >
        {menuOpen ? (
          <X className="w-5 h-5 text-black" />
        ) : (
          <EllipsisVertical className="w-5 h-5 text-black" />
        )}
      </button>
    </header>
  );
}
