import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SegmentTabs, { TAB_DM, TAB_GROUP } from "@/components/chat/SegmentTabs";
import ChatListItem from "@/components/chat/ChatListItem";
import { fetchRooms } from "@/services/chat";
import type { RoomResponseDTO } from "@/types/chat";

function SkeletonList() {
  return (
    <div className='flex flex-col gap-2 pb-24'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='h-16 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
        >
          <div className='h-full animate-pulse flex items-center gap-3 px-4'>
            <div className='w-11 h-11 rounded-full bg-gray-200' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-2/5 bg-gray-200 rounded' />
              <div className='h-3 w-3/4 bg-gray-200 rounded' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className='text-center text-sm text-gray-500 py-16'>
      {tab === TAB_DM ? "DM 대화가 없습니다." : "클래스·번개 대화가 없습니다."}
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab = tabParam === TAB_GROUP ? TAB_GROUP : TAB_DM;

  const { data, isLoading, isError, error, refetch } = useQuery<RoomResponseDTO[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchRooms,
    staleTime: 10_000,
  });

  const { dmRooms, groupRooms } = useMemo(() => {
    const rooms = data ?? [];
    return {
      dmRooms: rooms.filter((r) => r.roomType === "DM"),
      groupRooms: rooms.filter((r) => r.roomType === "LIGHT" || r.roomType === "CLASS"),
    };
  }, [data]);

  const list = tab === TAB_GROUP ? groupRooms : dmRooms;
  const onTab = (next: string) => {
    params.set("tab", next);
    setParams(params, { replace: true });
  };

  return (
    <div className='w-full max-w-md mx-auto px-2 sm:px-0'>
      <SegmentTabs value={tab} onChange={onTab} />

      {isLoading ? (
        <div className='px-2'>
          <SkeletonList />
        </div>
      ) : isError ? (
        <div className='px-4 py-8 text-center'>
          <p className='text-sm text-red-500'>
            {(error as Error)?.message || "채팅방을 불러오지 못했습니다."}
          </p>
          <button
            className='mt-3 px-4 py-2 rounded-lg bg-black text-white text-sm'
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className='flex flex-col gap-2 px-2 pb-24'>
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
        className='fixed bottom-24 right-6 sm:right-[calc(50%-16rem)] w-12 h-12 rounded-full shadow-lg bg-black text-white text-xl flex items-center justify-center'
        aria-label='새 대화'
      >
        +
      </button>
    </div>
  );
}
