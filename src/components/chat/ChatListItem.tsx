import type { RoomResponseDTO } from "@/services/chat";

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "??";
  const p = n.split(/\s+/);
  return p.length === 1 ? p[0]!.slice(0, 2) : `${p[0]![0] ?? ""}${p[1]![0] ?? ""}`;
}
const timeLabel = (t?: string | null) => t ?? "";

export default function ChatListItem({
  item,
  onClick,
}: {
  item: RoomResponseDTO;
  onClick: () => void;
}) {
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
          {item.unreadCount && item.unreadCount > 0 && (
            <span className='ml-2 shrink-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5'>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
