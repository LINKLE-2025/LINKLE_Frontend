import React, { memo, useState } from "react";
import dayjs from "dayjs";
import clsx from "clsx";

type RoomType = "DM" | "LIGHT" | "CLASS";

function initials(name?: string | null) {
    const n = (name ?? "").trim();
    if (!n) return "??";
    const p = n.split(/\s+/);
    return p.length === 1 ? p[0]!.slice(0, 2) : `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`;
}

type Props = {
    onClick?: () => void;
    /** 제목(방 이름) */
    title: string;
    /** 제목 아래 한 줄 메모 */
    memo?: string | null;
    /** 우측 상단 "N명 참여중" */
    memberCount?: number | null;
    /** 방 타입 (CLASS면 날짜 라벨 노출) */
    roomType?: RoomType;
    /** 시작일 (CLASS 전용) */
    startDate?: string | null;

    /** 아바타 이미지 URL (예: /api/chat/view/background/{roomId}) */
    avatarUrl?: string | null;
    /** 아바타 이미지 없을 때 이모지/문자 */
    avatarEmoji?: string;
    /** 아바타 배경색(이미지 있을 땐 투명 처리) */
    accentColor?: string;

    className?: string;
};

export default memo(function ChatListItem2({
    onClick,
    title,
    memo,
    memberCount,
    roomType,
    startDate,
    avatarUrl,
    avatarEmoji,
    accentColor = "#F3F4F6", // gray-100 비슷
    className,
}: Props) {
    const [avatarError, setAvatarError] = useState(false);

    const isClass = roomType === "CLASS";
    const hasStart = !!startDate;
    const isDue =
        isClass && hasStart
            ? dayjs(startDate).isSame(dayjs(), "day") || dayjs(startDate).isBefore(dayjs(), "day")
            : false;

    const startLabel =
        isClass && hasStart ? `${dayjs(startDate!).format("M월 D일")}${isDue ? " 마감" : ""}` : null;

    return (
        <button
            onClick={onClick}
            type="button"
            className={clsx(
                // ✅ ChatListItem과 동일한 래퍼 스타일
                "w-full text-left px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100",
                "hover:bg-gray-50 transition flex items-center gap-3",
                "active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-gray-100",
                className,
            )}
        >
            {/* ✅ 동일한 아바타 원 (44px, 동그라미, object-cover + 폴백 이니셜) */}
            {!avatarError && avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={title}
                    className="w-11 h-11 rounded-full object-cover"
                    decoding="async"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                />
            ) : (
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700"
                    style={{ background: accentColor }}
                >
                    {avatarEmoji ?? initials(title)}
                </div>
            )}

            {/* 본문 */}
            <div className="flex-1 min-w-0">
                {/* 상단: 제목 / 우측 메타(참여중) */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="font-medium text-black-900 truncate">{title}</div>
                        {/* 제목 아래 메모 */}
                        {memo ? (
                            <div className="mt-0.5 text-xs text-gray-400 truncate">{memo}</div>
                        ) : (
                            <div className="mt-0.5 text-xs text-gray-400 truncate">&nbsp;</div>
                        )}
                    </div>

                    {/* 우측 상단: N명 참여중 */}
                    <div className="shrink-0 text-right whitespace-nowrap leading-tight">
                        <div className="text-xs text-gray-500">
                            {typeof memberCount === "number" ? `${memberCount}명 참여중` : ""}
                        </div>
                        {/* CLASS면 아래 줄에 시작일(+마감) */}
                        {isClass && startLabel && (
                            <div className={clsx("text-[11px] mt-1", isDue ? "text-red-500 font-medium" : "text-gray-400")}>
                                {startLabel}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
});
