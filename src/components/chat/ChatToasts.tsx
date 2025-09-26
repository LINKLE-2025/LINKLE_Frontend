import React, { useEffect, useMemo, useRef, useState } from "react";
import { isRoomMuted, useMutedRoomIds } from "@/utils/notifyPrefs";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { stompClient } from "@/lib/stompClient";
import { useAuthStore } from "@/store/authStore";
import type { RoomResponseDTO } from "@/types/chat";

/* --- 정적 에셋용 BASE_URL 안전 절대경로 --- */
const asset = (p: string) => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    const path = p.replace(/^\/+/, "");
    return `${base}/${path}`;
};

/* --- DM 파트너 추론 유틸 (ChatListItem 로직 경량 복사) --- */
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
function genderFallbackSrc(gender?: string) {
    if (gender === "남성") return asset("icons/profile/Man.png");
    if (gender === "여성") return asset("icons/profile/Woman.png");
    return asset("icons/profile/Default.png");
}
const COLOR_ICON_NAME: Record<number, string> = {
    1: "red.png",
    2: "orange.png",
    3: "yellow.png",
    4: "green.png",
    5: "blue.png",
    6: "purple.png",
};

type Toast = {
    id: string; // 내부용 id (messageId 등)
    roomId: number;
    title: string;
    preview: string;
    imageSrc?: string;
    createdAtISO?: string;
};

const MAX_TOASTS = 1;
const AUTO_HIDE_MS = 1500; // 자동 사라짐 시간
const LEAVE_ANIM_MS = 180; // 퇴장 애니메이션 시간
const MAX_LIFETIME_MS = 1500;

export default function ChatToasts() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const currentUserId = user?.userId;

    const [toasts, setToasts] = useState<Toast[]>([]);
    const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
    const hideTimersRef = useRef<Map<string, number>>(new Map()); // auto-hide 타이머
    const leaveTimersRef = useRef<Map<string, number>>(new Map()); // 퇴장 애니메이션 후 제거 타이머
    const seenRef = useRef<Set<string>>(new Set()); // 중복 방지
    const safetyTimersRef = useRef<Map<string, number>>(new Map()); // 안전망 타이머

    // 음소거 목록 변경 시 리렌더 유도
    const _mutedIds = useMutedRoomIds();

    // 방 캐시에서 특정 roomId의 제목/이미지 후보 가져오기
    const rooms = queryClient.getQueryData<RoomResponseDTO[]>(["chatRooms"]) ?? [];
    const roomIndex = useMemo(() => {
        const map = new Map<string, RoomResponseDTO>();
        rooms.forEach((r: any) => map.set(String(r.roomId), r));
        return map;
    }, [rooms]);

    function buildToastFromEvent(evt: any): Toast | null {
        const rid =
            evt?.roomId ??
            evt?.room?.id ??
            evt?.room?.roomId ??
            evt?.id ??
            evt?.message?.roomId;
        if (rid == null) return null;
        if (isRoomMuted(Number(rid))) return null;

        const sid =
            evt?.senderId ?? evt?.sender?.id ?? evt?.userId ?? evt?.message?.senderId;
        if (
            typeof currentUserId === "number" &&
            typeof sid === "number" &&
            sid === currentUserId
        ) {
            return null;
        }

        const msgType = String(
            evt?.messageType ?? evt?.type ?? evt?.message?.type ?? ""
        ).toUpperCase();
        if (msgType !== "TEXT") return null;

        let preview: string | undefined =
            evt?.preview ??
            evt?.lastMessage ??
            evt?.lastMessagePreview ??
            evt?.text ??
            evt?.content ??
            evt?.message?.text ??
            evt?.message?.content ??
            undefined;

        if (!preview || String(preview).trim().length === 0) return null;

        const path = location.pathname;
        if (path.startsWith("/chat/room/")) {
            const openedId = Number(path.split("/").pop());
            if (Number(openedId) === Number(rid)) return null;
        }

        const r: any = roomIndex.get(String(rid));
        const roomType = String(r?.roomType ?? "").toUpperCase();
        const isDM = roomType === "DM";

        let title =
            (isDM ? r?.dmPartnerName : undefined) ??
            r?.friendName ??
            r?.roomName ??
            "새 메시지";

        let imageSrc: string | undefined;
        if (isDM) {
            const pid = extractPartnerId(r, currentUserId);
            if (typeof pid === "number") {
                imageSrc = `/api/user/view/profile/${pid}`;
            } else {
                const gender =
                    r?.dmPartnerGender ??
                    r?.dmPartner?.gender ??
                    r?.partnerGender ??
                    r?.gender ??
                    undefined;
                imageSrc = genderFallbackSrc(gender);
            }
        } else if (r?.roomId != null) {
            const bg = `/api/chat/view/background/${r.roomId}`;
            imageSrc = bg;
            if (!imageSrc && typeof r?.themeColor !== "undefined") {
                const cid =
                    typeof r.themeColor === "string"
                        ? Number(r.themeColor)
                        : r.themeColor;
                const cn = COLOR_ICON_NAME[cid as number];
                if (cn) imageSrc = asset(`icons/color/${cn}`);
            }
        }

        const id =
            (typeof evt?.messageId === "number"
                ? `mid:${evt.messageId}`
                : null) ??
            `rid:${rid}|t:${String(preview).slice(0, 40)}|at:${evt?.createdDate ?? evt?.sentAt ?? Date.now()
            }`;

        return {
            id,
            roomId: Number(rid),
            title: String(title),
            preview: String(preview),
            imageSrc,
            createdAtISO:
                evt?.createdDate ?? evt?.sentAt ?? new Date().toISOString(),
        };
    }

    function actuallyRemoveToast(id: string) {
        setToasts((prev) => prev.filter((x) => x.id !== id));
        setLeavingIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        const t2 = leaveTimersRef.current.get(id);
        if (t2) {
            window.clearTimeout(t2);
            leaveTimersRef.current.delete(id);
        }
        const t1 = hideTimersRef.current.get(id);
        if (t1) {
            window.clearTimeout(t1);
            hideTimersRef.current.delete(id);
        }
    }

    function startLeave(id: string, delay = 0) {
        setLeavingIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
        const run = () => {
            const t = window.setTimeout(() => actuallyRemoveToast(id), LEAVE_ANIM_MS);
            leaveTimersRef.current.set(id, t as unknown as number);
        };
        if (delay > 0) {
            const t = window.setTimeout(run, delay);
            leaveTimersRef.current.set(id, t as unknown as number);
        } else {
            run();
        }
    }

    function pushToast(t: Toast) {
        if (seenRef.current.has(t.id)) return;
        seenRef.current.add(t.id);
        setToasts((prev) => [t, ...prev].slice(0, MAX_TOASTS));
        const timer = window.setTimeout(() => startLeave(t.id), AUTO_HIDE_MS);
        hideTimersRef.current.set(t.id, timer as unknown as number);

        const safety = window.setTimeout(() => startLeave(t.id), MAX_LIFETIME_MS);
        safetyTimersRef.current.set(t.id, safety as unknown as number);
    }

    useEffect(() => {
        if (!currentUserId) return;
        const topic = `/sub/users.${currentUserId}.room-updates`;
        const off = stompClient.subscribe(topic, (evt) => {
            const t = buildToastFromEvent(evt);
            if (t) pushToast(t);
        });
        return () => {
            try {
                off?.();
            } catch { }
            hideTimersRef.current.forEach((id) => window.clearTimeout(id));
            leaveTimersRef.current.forEach((id) => window.clearTimeout(id));
            hideTimersRef.current.clear();
            leaveTimersRef.current.clear();
        };
    }, [currentUserId, location.pathname, _mutedIds]);

    const container = (
        <div
            className="fixed left-1/2 -translate-x-1/2 z-[9999]
                 top-[max(env(safe-area-inset-top),12px)]
                 w-[min(92vw,420px)] space-y-2 pointer-events-none"
            aria-live="polite"
        >
            {toasts.map((t) => {
                const leaving = leavingIds.has(t.id);
                return (
                    <div
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/chat/room/${t.roomId}`)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                navigate(`/chat/room/${t.roomId}`);
                            }
                        }}
                        onMouseEnter={() => {
                            const t1 = hideTimersRef.current.get(t.id);
                            if (t1) {
                                window.clearTimeout(t1);
                                hideTimersRef.current.delete(t.id);
                            }
                            const t2 = leaveTimersRef.current.get(t.id);
                            if (t2) {
                                window.clearTimeout(t2);
                                leaveTimersRef.current.delete(t.id);
                            }
                        }}
                        onMouseLeave={() => {
                            startLeave(t.id, 1600);
                        }}
                        className={`pointer-events-auto w-full text-left
                        bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80
                        border border-gray-200 rounded-2xl shadow-lg
                        hover:shadow-xl transition-all duration-200
                        ${leaving
                                ? "animate-toast-leave pointer-events-none"
                                : "animate-toast-enter"
                            }`}
                    >
                        <div className="p-3 flex gap-3 items-start">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                {t.imageSrc ? (
                                    <img
                                        src={t.imageSrc}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        decoding="async"
                                        draggable={false}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                                asset("icons/user-default.png");
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={asset("icons/user-default.png")}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-gray-900 truncate">
                                        {t.title}
                                    </span>
                                    <span className="text-[11px] text-gray-400 shrink-0">지금</span>
                                </div>
                                <p className="mt-0.5 text-[13px] leading-5 text-gray-600 line-clamp-2 break-all">
                                    {t.preview}
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="닫기"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startLeave(t.id);
                                }}
                                className="ml-1 text-gray-400 hover:text-gray-600 transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                );
            })}

            <style>
                {`
        @keyframes toast-enter {
          from { transform: translateY(-12px); opacity: 0; }
          to   { transform: translateY(0);      opacity: 1; }
        }
        @keyframes toast-leave {
          from { transform: translateY(0);      opacity: 1; }
          to   { transform: translateY(-8px);   opacity: 0; }
        }
        .animate-toast-enter { animation: toast-enter 160ms ease-out; }
        .animate-toast-leave { animation: toast-leave 180ms ease-in forwards; }
        `}
            </style>
        </div>
    );

    return createPortal(container, document.body);
}
