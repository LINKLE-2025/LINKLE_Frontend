// src/pages/chat/ChatListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SegmentTabs, { TAB_DM, TAB_GROUP } from "@/components/chat/SegmentTabs";
import ChatListItem from "@/components/chat/ChatListItem";
import { fetchRooms } from "@/services/chat";
import type { RoomResponseDTO } from "@/types/chat";
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

// 최신 메시지 시간 기준 정렬
function sortByLastMessage<T extends RoomResponseDTO>(arr: T[]) {
  return arr.slice().sort((a: any, b: any) => {
    const ta = new Date(a.lastMessageDate ?? (a as any).lastMessageAt ?? 0).getTime();
    const tb = new Date(b.lastMessageDate ?? (b as any).lastMessageAt ?? 0).getTime();
    return tb - ta;
  });
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab = tabParam === TAB_GROUP ? TAB_GROUP : TAB_DM;

  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  // 로그인 유저 id 1회 로드 (UI 용도)
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

  // ✅ 전역 useRoomUpdates()가 캐시를 부분 패치하므로, 여기서는 '읽기 전용'
  const { data, isLoading, isError, error } = useQuery<RoomResponseDTO[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchRooms,
    staleTime: 30_000,            // 충분한 staleTime
    refetchOnMount: false,        // 의도치 않은 재요청 방지
    refetchOnWindowFocus: false,  // 포커스 시 출렁임 방지
  });

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
          {/* 필요시 수동 새로고침 버튼만 유지 */}
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
