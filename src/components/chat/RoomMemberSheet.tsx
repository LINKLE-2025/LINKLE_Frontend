// src/components/chat/RoomMemberSheet.tsx
import { Info, BellOff, Users } from "lucide-react";
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
};

function pickMemberAvatar(m: any): string {
    const raw = m?.image ?? m?.profileImageUrl ?? m?.userImage ?? null;
    return resolveImageUrl(raw ?? undefined) ?? userProfileUrl(m?.userId);
}
function pickMemberNick(m: any, room: RoomResponseDTO): string {
    const ownNick = m?.nickname ?? m?.nick ?? m?.userNickname;
    if (typeof ownNick === "string" && ownNick.trim()) return ownNick;
    if (room.roomType === "DM") {
        const partnerId = room.friendUserId ?? (room as any).dmPartnerId;
        if (partnerId && Number(partnerId) === Number(m?.userId)) {
            const dmNick = (room as any).dmPartnerNickname ?? (room as any).friendNickname ?? null;
            if (typeof dmNick === "string" && dmNick.trim()) return dmNick;
        }
    }
    return String(m?.userId ?? "");
}

export default function RoomMemberSheet({
    open,
    onClose,
    room,
    members,
    onLeave,
    headerHeight = 0,
    footerHeight = 0,
}: Props) {
    const [leaving, setLeaving] = useState(false);
    const [memoOpen, setMemoOpen] = useState(false); // ✅ 추가

    const countLabel = useMemo(() => {
        const n = members?.length ?? room.memberCount ?? 0;
        return `${n}명 참여 중`;
    }, [members, room.memberCount]);

    const normalizedMembers = useMemo(
        () =>
            (members ?? []).map((m) => ({
                id: m.userId,
                name: m.name,
                avatar: pickMemberAvatar(m),
                nick: pickMemberNick(m as any, room),
            })),
        [members, room],
    );

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

                    {/* ✅ Info 아이콘을 버튼으로 변경해서 메모 모달 열기 */}
                    <button
                        type="button"
                        onClick={() => setMemoOpen(true)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100"
                        aria-label="방 메모 보기"
                    >
                        <Info className="w-5 h-5 text-gray-500" />
                    </button>
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
                                    <div className="text-sm font-semibold text-gray-900 truncate">{m.name}</div>
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
                            {/* 단순 표시용 */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 17h-1v-4h-1m1-4h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" /></svg>
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

            {/* ✅ 방 메모 모달 (시트 위에 뜸) */}
            <RoomMemoModal
                room={room}
                isOpen={memoOpen}
                onClose={() => setMemoOpen(false)}
            />

            {/* animations */}
            <style>{`
        .animate-fadeIn { animation: fadeIn .15s ease-out; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-slideIn { animation: slideIn .2s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
        </>
    );
}
