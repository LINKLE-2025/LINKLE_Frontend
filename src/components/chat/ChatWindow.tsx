import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useChatRoom } from "@/hooks/useChatRoom";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatOutletContext } from "@/layouts/ChatLayout";

export default function ChatWindow({ roomId }: { roomId: number }) {
  const { headerHeight, footerHeight, setRoomHeader } =
    useOutletContext<ChatOutletContext>();

  const {
    room, peer, msgs, status, send,
    bottomRef, listContainerRef, membersById,
    isDM, hasMore, loadingOlder, loadOlder,
  } = useChatRoom(roomId);

  const [inputHeight, setInputHeight] = useState(56);
  const peerName = useMemo(() => peer?.name ?? null, [peer]);

  useEffect(() => {
    if (!room) return;

    if (room.roomType === "DM") {
      setRoomHeader({
        room,
        dmName: peer?.name ?? room.friendName ?? null,
        dmNick:
          (room as any).dmPartnerNickname
          ?? (peer?.nick ?? (room.friendUserId != null ? String(room.friendUserId) : null)),
        dmUserId: (peer as any)?.id ?? room.friendUserId ?? null,    // 사진용 id
      });
    } else {
      setRoomHeader({ room });
    }

    return () => setRoomHeader(null);
  }, [room, peer, setRoomHeader]);

  if (!room) return <div className="p-4">Loading...</div>;

  return (
    <>
      <MessageList
        msgs={msgs}
        peerName={peerName}
        bottomRef={bottomRef}
        membersById={membersById}
        isDM={isDM}
        headerHeightPx={headerHeight}
        footerHeightPx={footerHeight}
        inputHeightPx={inputHeight}
        listContainerRef={listContainerRef}
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        loadOlder={loadOlder}
      />

      <ChatInput
        onSend={send}
        footerHeightPx={footerHeight}
        onHeightChange={setInputHeight}
      />

      {status !== "open" && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          {status === "connecting" ? "연결 중..." : status === "closed" ? "연결 종료" : "에러"}
        </div>
      )}
    </>
  );
}
