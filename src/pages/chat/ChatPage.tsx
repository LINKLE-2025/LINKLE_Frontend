// src/pages/chat/ChatPage.tsx
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// .env
const API_BASE = import.meta.env.VITE_API_SERVER as string;
const DEV_UID = String(import.meta.env.VITE_DEV_USER_ID ?? "1");

// ===== Types =====
type RoomType = "DM" | "LIGHT" | "CLASS";

export type RoomResponse = {
  roomId: number;
  roomType: RoomType;
  roomName?: string | null;
  friendName?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number | null;
  avatarUrl?: string | null;
};

// 서버 응답 key가 섞여 있을 수 있어 보정용
type AnyRoom = Partial<RoomResponse> & Record<string, unknown>;

// ===== Tabs =====
const TAB_DM = "dm";
const TAB_GROUP = "group";

// ===== Utils =====
function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const parts = n.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`;
}
function timeLabel(t?: string | null) {
  return t ?? "";
}

// ===== API =====
async function fetchRooms(): Promise<RoomResponse[]> {
  const res = await fetch(`${API_BASE}/chat/room`, {
    headers: {
      Accept: "application/json",
      "x-user-id": DEV_UID,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to load rooms (${res.status})`);
  }
  const data = await res.json();
  const raw: AnyRoom[] = Array.isArray(data) ? data : (data?.content ?? []);
  // key 보정
  const normalized: RoomResponse[] = raw.map((r: AnyRoom) => ({
    roomId: (r.roomId as number) ?? (r.id as number),
    roomType: (r.roomType as RoomType) ?? "DM",
    roomName: (r.roomName as string) ?? (r.name as string) ?? null,
    friendName: (r.friendName as string) ?? (r.friendName as string) ?? null,
    lastMessage: (r.lastMessage as string) ?? (r.lastText as string) ?? null,
    lastMessageAt: (r.lastMessageAt as string) ?? (r.lastAt as string) ?? null,
    unreadCount: (r.unreadCount as number) ?? (r.unread as number) ?? 0,
    avatarUrl: (r.avatarUrl as string) ?? null,
  }));
  return normalized;
}

// ===== Presentational =====
function SegmentTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const base = "flex-1 py-2 text-sm font-medium rounded-full transition";
  const active = "bg-black text-white";
  const inactive = "bg-gray-100 text-gray-600 hover:bg-gray-200";
  return (
    <div className='mx-4 mt-2 mb-3 bg-gray-100 rounded-full p-1 flex gap-1'>
      <button
        className={`${base} ${value === TAB_DM ? active : inactive}`}
        onClick={() => onChange(TAB_DM)}
      >
        내 DM
      </button>
      <button
        className={`${base} ${value === TAB_GROUP ? active : inactive}`}
        onClick={() => onChange(TAB_GROUP)}
      >
        클래스·번개
      </button>
    </div>
  );
}

function ChatListItem({ item, onClick }: { item: RoomResponse; onClick: () => void }) {
  const title = item.roomType === "DM" ? item.friendName : item.roomName;
  return (
    <button
      onClick={onClick}
      className='w-full text-left px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition flex items-center gap-3'
    >
      {item.avatarUrl ? (
        <img
          src={item.avatarUrl}
          alt={title ?? ""}
          className='w-11 h-11 rounded-full object-cover'
        />
      ) : (
        <div className='w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700'>
          {initials(title)}
        </div>
      )}

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <p className='font-medium text-gray-900 truncate'>{title || "(이름 없음)"}</p>
          <span className='text-xs text-gray-400 shrink-0'>{timeLabel(item.lastMessageAt)}</span>
        </div>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-sm text-gray-500 truncate'>
            {item.lastMessage || "대화를 시작해 보세요"}
          </p>
          {item.unreadCount && item.unreadCount > 0 ? (
            <span className='ml-2 shrink-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5'>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

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

// ===== Page =====
export default function ChatPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === TAB_GROUP ? TAB_GROUP : TAB_DM;

  const { data, isLoading, isError, error, refetch } = useQuery<RoomResponse[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchRooms,
    staleTime: 1000 * 10,
  });

  const { dmRooms, groupRooms } = useMemo(() => {
    const rooms = data ?? [];
    const dm = rooms.filter((r) => r.roomType === "DM");
    const group = rooms.filter((r) => r.roomType === "LIGHT" || r.roomType === "CLASS");
    return { dmRooms: dm, groupRooms: group };
  }, [data]);

  const list = tab === TAB_GROUP ? groupRooms : dmRooms;

  const handleTab = (next: string) => {
    params.set("tab", next);
    setParams(params, { replace: true });
  };

  return (
    <div className='w-full max-w-md mx-auto px-2 sm:px-0'>
      <SegmentTabs value={tab} onChange={handleTab} />

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
        <>
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
        </>
      )}

      {/* 필요 없으면 제거 */}
      <button
        onClick={() => navigate("/friend")} // ← 여기만 교체
        className='fixed bottom-24 right-6 sm:right-[calc(50%-16rem)] w-12 h-12 rounded-full shadow-lg bg-black text-white text-xl flex items-center justify-center'
        aria-label='새 대화'
      >
        +
      </button>
    </div>
  );
}
