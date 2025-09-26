// src/pages/chat/ChatPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SegmentTabs, { TAB_DM, TAB_GROUP } from "@/components/chat/SegmentTabs";
import ChatListItem from "@/components/chat/ChatListItem";
import { fetchRooms } from "@/services/chat";
import type { RoomResponseDTO } from "@/types/chat";
import { stompClient } from "@/lib/stompClient";
import { getCurrentUserId } from "@/api/authApi";
import { Plus } from "lucide-react";

function SkeletonList() {
  return (
    <div className="flex flex-col gap-2 pb-24">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="h-full animate-pulse flex items-center gap-3 px-4">
            <div className="w-11 h-11 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/5 bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="text-center text-sm text-gray-500 py-16">
      {tab === TAB_DM ? "DM 대화가 없습니다." : "클래스·번개 대화가 없습니다."}
    </div>
  );
}

// 공통 정렬 함수: 최신 메시지가 위로
function sortByLastMessage<T extends RoomResponseDTO>(arr: T[]) {
  return arr.slice().sort((a: any, b: any) => {
    const ta = new Date(a.lastMessageDate ?? (a as any).lastMessageAt ?? 0).getTime();
    const tb = new Date(b.lastMessageDate ?? (b as any).lastMessageAt ?? 0).getTime();
    return tb - ta;
  });
}

// 안전 비교(숫자/문자 혼용 대비)
const sameId = (a: unknown, b: unknown) => String(a) === String(b);

export default function ChatPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab = tabParam === TAB_GROUP ? TAB_GROUP : TAB_DM;

  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  // 로그인 유저 id 1회 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      const uid = await getCurrentUserId().catch(() => undefined);
      if (alive && typeof uid === "number") setCurrentUserId(uid);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 방 목록 로드 (재진입 시 항상 최신 요청하도록 refetchOnMount)
  const { data, isLoading, isError, error, refetch } = useQuery<RoomResponseDTO[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchRooms,
    staleTime: 10_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // 시간순 정렬 + 탭 분리
  const { dmRooms, groupRooms } = useMemo(() => {
    const rooms = sortByLastMessage(data ?? []);
    return {
      dmRooms: rooms.filter((r) => String((r as any).roomType).toUpperCase() === "DM"),
      groupRooms: rooms.filter((r) => {
        const t = String((r as any).roomType).toUpperCase();
        return t === "LIGHT" || t === "CLASS";
      }),
    };
  }, [data]);

  const list = tab === TAB_GROUP ? groupRooms : dmRooms;

  const onTab = (next: string) => {
    params.set("tab", next);
    setParams(params, { replace: true });
  };

  // ---- 이벤트 핸들러 (공통 적용) ----
  const applyEventToCache = (evt: any) => {
    queryClient.setQueryData<RoomResponseDTO[]>(["chatRooms"], (prev) => {
      if (!prev) return prev;

      const rid = evt?.roomId ?? evt?.room?.id ?? evt?.id;
      if (rid == null) return prev;

      const idx = prev.findIndex((r) => sameId((r as any).roomId, rid));
      if (idx === -1) return prev;

      const before: any = prev[idx];
      const updated: any = { ...before };

      const type = String(evt?.type ?? evt?.eventType ?? "").toUpperCase();

      // 미리보기/시간 폴백
      const preview =
        evt?.preview ??
        evt?.lastMessage ??
        evt?.lastMessagePreview ??
        evt?.text ??
        (typeof evt?.content === "string" ? evt.content : undefined);

      const when =
        evt?.createdDate ??
        evt?.sentAt ??
        evt?.lastMessageDate ??
        evt?.lastMessageAt ??
        null;

      if (typeof preview === "string") updated.lastMessagePreview = preview;
      if (when) updated.lastMessageDate = when;

      // --- unread 갱신 ---
      const looksLikeRead = type.includes("READ") || type.includes("ACK");
      if (looksLikeRead) {
        // ✅ 내가 읽은 경우에만 0 처리 (남이 읽은 READ 이벤트는 무시)
        const readerId = evt?.readerId ?? evt?.userId ?? evt?.reader?.id;
        const isMyRead =
          typeof readerId === "number" &&
          typeof currentUserId === "number" &&
          readerId === currentUserId;

        updated.unreadCount = isMyRead
          ? 0
          : Number(before.unreadCount ?? 0); // 남이 읽은 건 유지
      } else if (typeof evt?.unreadCount === "number") {
        updated.unreadCount = Math.max(0, evt.unreadCount);
      } else if (type === "MESSAGE_CREATED" || type === "ROOM_LAST_MESSAGE_UPDATED") {
        const sid = evt?.senderId ?? evt?.sender?.id ?? evt?.userId;
        const isMine =
          typeof sid === "number" &&
          typeof currentUserId === "number" &&
          sid === currentUserId;
        const prevUnread = Number(before.unreadCount ?? 0);
        updated.unreadCount = isMine ? prevUnread : prevUnread + 1;
      }
      // --- end ---

      const next = prev.slice();
      next[idx] = updated as RoomResponseDTO;
      return sortByLastMessage(next);
    });
  };

  // ✅ 유저 단일 토픽 구독
  useEffect(() => {
    if (!currentUserId || !data?.length) return;
    const topic = `/sub/users.${currentUserId}.room-updates`;
    const off = stompClient.subscribe(topic, applyEventToCache);
    return () => {
      try {
        off?.();
      } catch { }
    };
  }, [currentUserId, data]);

  // ✅ 각 방 토픽도 구독 (보강용)
  const roomSubMapRef = useRef<Map<string, () => void>>(new Map());
  useEffect(() => {
    if (!data?.length) return;
    const subMap = roomSubMapRef.current;

    for (const r of data) {
      const rid = String((r as any).roomId);
      if (subMap.has(rid)) continue;

      const topic = `/sub/room.${rid}`;
      const off = stompClient.subscribe(topic, applyEventToCache);
      subMap.set(rid, off);
    }

    return () => {
      for (const [, off] of subMap) {
        try {
          off?.();
        } catch { }
      }
      subMap.clear();
    };
  }, [data]);

  // 브라우저 포커스/가시성 복귀 시 refetch
  useEffect(() => {
    const onFocus = () => refetch();
    const onVis = () => {
      if (document.visibilityState === "visible") refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refetch]);

  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-0">
      <SegmentTabs value={tab} onChange={onTab} />

      {isLoading ? (
        <div className="px-2">
          <SkeletonList />
        </div>
      ) : isError ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-red-500">
            {(error as Error)?.message || "채팅방을 불러오지 못했습니다."}
          </p>
          <button
            className="mt-3 px-4 py-2 rounded-lg bg-black text-white text-sm"
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-2 pb-24">
          {list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            list.map((item) => (
              <ChatListItem
                key={item.roomId}
                item={item}
                onClick={() => navigate(`/chat/room/${item.roomId}`)}
              />
            ))
          )}
        </div>
      )}

      <button
        onClick={() => navigate("/profile/friend")}
        className="fixed bottom-[calc(min(env(safe-area-inset-bottom),16px)+6rem)] right-6 sm:right-[calc(50%-14rem)] 
                    w-10 h-10 xxs:w-12 xxs:h-12 rounded-full shadow-md bg-black text-white text-xl 
                    flex items-center justify-center active:scale-95 transition-transform"
        aria-label="새 대화"
      >
        <Plus className="w-5 h-5 xxs:w-6 xxs:h-6 " />
      </button>
    </div>
  );
}