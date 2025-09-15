// src/components/chat/RoomMemberSheet.tsx
import { Info, Users } from "lucide-react";
import type { MemberResponseDTO, RoomResponseDTO } from "@/types/chat";
import { useMemo, useState } from "react";
import { userProfileUrl, resolveImageUrl } from "@/utils/chat";
import RoomMemoModal from "@/components/modal/RoomMemoModal";

type Props = {
    open: boolean;
    onClose: () => void;
    room: RoomResponseDTO;
    members: MemberResponseDTO[];
    onLeave: () => Promise<void>;
    headerHeight?: number;
    footerHeight?: number;
    currentUserId?: number;
};

function pickMemberAvatar(m: MemberResponseDTO): string {
    const raw = (m as any)?.image ?? (m as any)?.profileImageUrl ?? (m as any)?.userImage ?? null;
    return resolveImageUrl(raw ?? undefined) ?? userProfileUrl(m.userId);
}

function pickMemberNick(m: MemberResponseDTO): string {
    if (typeof m.nickname === "string" && m.nickname.trim()) return m.nickname.trim();
    const alt = (m as any).nick ?? (m as any).userNickname;
    if (typeof alt === "string" && alt.trim()) return alt.trim();
    return String(m.userId);
}

export default function RoomMemberSheet({
    open,
    onClose,
    room,
    members,
    onLeave,
    headerHeight = 0,
    footerHeight = 0,
    currentUserId,
}: Props) {
    const [leaving, setLeaving] = useState(false);
    const [memoOpen, setMemoOpen] = useState(false);

    const countLabel = useMemo(() => {
        const n = members?.length ?? room.memberCount ?? 0;
        return `${n}명 참여 중`;
    }, [members, room.memberCount]);

    // 멤버 정규화 + 내 계정 표시 + "나 먼저" 정렬
    const normalizedMembers = useMemo(() => {
        const base = (members ?? []).map((m) => {
            const isSelf = currentUserId != null && Number(m.userId) === Number(currentUserId);
            return {
                id: m.userId,
                name: m.name,
                avatar: pickMemberAvatar(m),
                nick: pickMemberNick(m),
                isSelf,
            };
        });
        // 나(본인) 최상단, 나머지는 이름 오름차순(원하면 제거/변경 가능)
        base.sort((a, b) => {
            if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        return base;
    }, [members, currentUserId]);

    const handleLeave = async () => {
        if (leaving) return;
        const ok = window.confirm("정말 이 채팅방을 나가시겠어요?");
        if (!ok) return;
        try {
            setLeaving(true);
            await onLeave();
        } finally {
            setLeaving(false);
        }
    };

    if (!open) return null;

    const areaStyle = { top: headerHeight, bottom: footerHeight } as const;

    return (
        <>
            {/* 헤더~푸터 사이 백드롭 */}
            <div
                className="fixed left-0 right-0 bg-black/40 z-[40] animate-fadeIn"
                style={areaStyle}
                onClick={onClose}
            />

            {/* 시트 */}
            <aside
                className="fixed right-0 z-[41] w-full max-w-md bg-white border-l border-gray-200 flex flex-col animate-slideIn shadow-none"
                style={areaStyle}
                role="dialog"
                aria-label="채팅방 정보"
            >
                {/* 상단바 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                        <Users className="w-5 h-5 shrink-0" />
                        <span className="font-medium truncate">{countLabel}</span>
                    </div>

                    {/* DM 방에서는 Info 버튼 숨김 */}
                    {room.roomType !== "DM" && (
                        <button
                            type="button"
                            onClick={() => setMemoOpen(true)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100"
                            aria-label="방 메모 보기"
                        >
                            <Info className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* 참여자 리스트 */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <ul className="space-y-3">
                        {normalizedMembers.map((m) => (
                            <li key={m.id} className="flex items-center gap-3">
                                <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                    draggable={false}
                                />
                                <div className="min-w-0 flex-1 leading-tight">
                                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 truncate">
                                        <span className="truncate">{m.name}</span>
                                        {m.isSelf && (
                                            <img
                                                src="/icons/profile/isSelf.svg"
                                                alt="본인 프로필"
                                                className="inline-block w-4 h-4 shrink-0"
                                                draggable={false}
                                            />
                                        )}
                                    </div>
                                    <div className="text-[11px] text-gray-500 truncate">@{m.nick}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 하단 액션 */}
                <div className="border-t border-gray-200 px-4 py-3 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-sm">알림 끄기</span>
                        </div>
                        <div className="w-10 h-6 rounded-full bg-gray-200" />
                    </div>

                    <button
                        onClick={handleLeave}
                        disabled={leaving}
                        className="w-full py-3 text-red-500 font-semibold rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-50"
                    >
                        {leaving ? "나가는 중..." : "채팅방 나가기"}
                    </button>
                </div>
            </aside>

            {/* 방 메모 모달 */}
            <RoomMemoModal room={room} isOpen={memoOpen} onClose={() => setMemoOpen(false)} />

            <style>{`
        .animate-fadeIn { animation: fadeIn .15s ease-out; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-slideIn { animation: slideIn .2s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
        </>
    );
}
