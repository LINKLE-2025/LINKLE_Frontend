// src/components/chat/RoomMemberSheet.tsx
import { Info, Users, Crown } from "lucide-react";
import type { MemberResponseDTO, RoomResponseDTO } from "@/types/chat";
import { useMemo, useState, useEffect } from "react";
import { resolveImageUrl } from "@/utils/chat";
import RoomMemoModal from "@/components/modal/RoomMemoModal";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllFriends, getFriendRelationship } from "@/api/friendApi";
import type { FriendResponse } from "@/types/friend";
import { useRoomMute, setRoomMuted, toggleRoomMuted } from "@/utils/notifyPrefs";

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

const asset = (p: string) => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    const path = p.replace(/^\/+/, "");
    return `${base}/${path}`;
};



// 성별별 디폴트 이미지
function genderFallbackSrc(gender?: string | null) {
    if (gender === "남성") return "/icons/profile/Man.png";
    if (gender === "여성") return "/icons/profile/Woman.png";
    return "/icons/profile/Default.png";
}

function pickMemberNick(m: MemberResponseDTO): string {
    if (typeof m.nickname === "string" && m.nickname.trim()) return m.nickname.trim();
    const alt = (m as any).nick ?? (m as any).userNickname;
    if (typeof alt === "string" && alt.trim()) return alt.trim();
    return String(m.userId);
}

function initials(name?: string | null) {
    const n = (name ?? "").trim();
    if (!n) return "??";
    const p = n.split(/\s+/);
    return p.length === 1 ? p[0]!.slice(0, 2) : `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`;
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

// 개별 멤버 행: 이미지 실패 시 순차 폴백 + blob 재시도 1회
function MemberRow({
    m,
    isSelf,
    showCrown,
    onClick,
}: {
    m: MemberResponseDTO & { id?: number; nick?: string };
    isSelf: boolean;
    showCrown?: boolean;
    onClick?: () => void;
}) {
    const name = m.name;
    const nick = pickMemberNick(m);

    // 1) 서버 절대/상대 URL -> resolve
    const raw = (m as any)?.image ?? (m as any)?.profileImageUrl ?? (m as any)?.userImage ?? null;
    const resolved = resolveImageUrl(raw ?? undefined);

    // 후보 src 우선순위: resolved → /api/user/view/profile/:id → genderFallback
    const candidates = useMemo(() => {
        const arr: string[] = [];
        if (resolved) arr.push(resolved);
        if (typeof m.userId === "number") arr.push(`/api/user/view/profile/${m.userId}`);
        arr.push(genderFallbackSrc(m.gender));
        // 중복 제거
        return Array.from(new Set(arr.filter(Boolean)));
    }, [resolved, m.userId, m.gender]);

    const [idx, setIdx] = useState(0);
    const currentSrc = candidates[idx];
    const [exhausted, setExhausted] = useState(false);

    // blob 재시도 상태
    const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
    const [triedAuthFetch, setTriedAuthFetch] = useState(false);

    useEffect(() => {
        setIdx(0);
        setExhausted(false);
        setBlobUrl(undefined);
        setTriedAuthFetch(false);
    }, [candidates.length, resolved, m.userId, m.gender]);

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    const displaySrc = blobUrl ?? currentSrc;

    const onImgError = async () => {
        // 동일 출처 /api/* 이면 1회 쿠키 포함 fetch로 blob 재시도 (모바일 쿠키 미부착 대응)
        if (!triedAuthFetch && isSameOriginApi(currentSrc)) {
            setTriedAuthFetch(true);
            try {
                const res = await fetch(currentSrc!, { credentials: "include" });
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
                // ignore → 다음 후보로
            }
        }

        const next = idx + 1;
        if (next < candidates.length) setIdx(next);
        else setExhausted(true);
    };

    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className="w-full flex items-center gap-3 text-left rounded-lg hover:bg-gray-50 active:bg-gray-100 px-2 py-1.5 transition"
            >
                {displaySrc && !exhausted ? (
                    <img
                        src={displaySrc}
                        alt={name}
                        className="w-8 h-8 rounded-full object-cover"
                        draggable={false}
                        onError={onImgError}
                    />
                ) : (
                    <img
                        src={asset("icons/user-default.png")}
                        alt="기본 사용자 아이콘"
                        className="w-8 h-8 rounded-full"
                    />
                )}

                <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 truncate">
                        <span className="truncate">{name}</span>
                        {showCrown && (
                            <Crown
                                className="w-4 h-4 shrink-0 text-yellow-400 fill-yellow-400"
                                aria-label="방장"
                            />
                        )}
                        {isSelf && (
                            <img
                                src="/icons/profile/isSelf.svg"
                                alt="본인 프로필"
                                className="inline-block w-4 h-4 shrink-0"
                                draggable={false}
                            />
                        )}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">@{nick}</div>
                </div>
            </button>
        </li>
    );
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

    const navigate = useNavigate();
    const location = useLocation();

    const ownerId = (room as any).owner_id ?? (room as any).ownerId;

    const roomIdNum = Number((room as any)?.roomId);
    const muted = useRoomMute(roomIdNum);

    const countLabel = useMemo(() => {
        const n = members?.length ?? room.memberCount ?? 0;
        return `${n}명 참여 중`;
    }, [members, room.memberCount]);

    // 멤버 정규화 + 내 계정 표시 + "나 먼저" 정렬
    const normalizedMembers = useMemo(() => {
        const base = (members ?? []).map((m) => {
            const isSelf = currentUserId != null && Number(m.userId) === Number(currentUserId);
            const isOwner =
                room?.roomType === "CLASS" &&
                ownerId != null &&
                Number(m.userId) === Number(ownerId);
            return {
                ...m,
                id: m.userId,
                isSelf,
                isOwner,
            };
        });
        base.sort((a, b) => {
            if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        return base;
    }, [members, currentUserId, room?.roomType, ownerId]);

    // --- 친구목록 캐시: friendId, gender 맵 구성
    const [friendIndex, setFriendIndex] = useState<Record<number, FriendResponse | undefined>>({});
    useEffect(() => {
        (async () => {
            if (!open) return;
            if (!currentUserId) return;
            try {
                const list = await getAllFriends(Number(currentUserId));
                const idx: Record<number, FriendResponse> = {};
                for (const f of list) {
                    idx[f.userId1] = f;
                    idx[f.userId2] = f;
                }
                setFriendIndex(idx);
            } catch (err) {
                console.error("친구 목록 불러오기 실패:", err);
                setFriendIndex({});
            }
        })();
    }, [open, currentUserId]);

    // --- 멤버 클릭: 관계 조회 후 /profile 이동
    const handleMemberClick = async (m: MemberResponseDTO) => {
        if (!currentUserId || !m?.userId) return;

        let type: "self" | "friend" | "sent" | "received" | "stranger" | undefined;
        let friendId: number | undefined;

        if (Number(currentUserId) === Number(m.userId)) {
            type = "self";
        } else {
            try {
                const relation = await getFriendRelationship(Number(currentUserId), Number(m.userId));

                if (!relation.exists || relation.state === "NONE") {
                    type = "stranger";
                } else if (relation.state === "ACCEPTED") {
                    type = "friend";
                    friendId = relation.friendId;   // 서버 응답에서 friendId 가져오기
                } else if (relation.state === "REQUESTED") {
                    type = relation.userId1 === Number(currentUserId) ? "sent" : "received";
                    friendId = relation.friendId;   // 요청 상태에서도 friendId 있음
                }
            } catch (e) {
                console.warn("관계 조회 실패, type 생략하고 진행:", e);
                type = undefined;
            }
        }

        // 보조적으로 friendIndex에서 gender 가져오기
        const friend = friendIndex[Number(m.userId)];
        const gender = (friend as any)?.gender ?? (m as any)?.gender ?? "남성";

        navigate("/profile", {
            state: {
                userId: m.userId,
                friendId,  // ✅ relation 기반으로 보장
                gender,
                pathname: location.pathname,
                ...(type ? { type } : {}),
                currentUserId,
            },
        });
    };

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
                            <MemberRow
                                key={m.id}
                                m={m}
                                isSelf={m.isSelf as boolean}
                                showCrown={m.isOwner}
                                onClick={() => handleMemberClick(m)}
                            />
                        ))}
                    </ul>
                </div>

                {/* 하단 액션 */}
                <div className="border-t border-gray-200 px-4 py-3 bg-white">

                    {/* 알림 ON/OFF */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-sm">
                                알림 {muted ? "꺼짐" : "켜짐"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => toggleRoomMuted(roomIdNum)}
                            className={`relative w-10 h-6 rounded-full transition-colors
                        ${muted ? "bg-red-500" : "bg-gray-300"}`}
                            aria-pressed={muted}
                            aria-label={muted ? "알림 켜기" : "알림 끄기"}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                          transition-transform duration-200
                          ${muted ? "translate-x-4" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                    <button
                        onClick={handleLeave}
                        disabled={leaving}
                        className="w-full py-3 text-red-500 font-semibold rounded-xl border border-red-200 disabled:opacity-50
            hover:bg-red-50 transition-colors"
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
