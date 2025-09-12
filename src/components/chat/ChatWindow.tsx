// src/components/chat/ChatWindow.tsx
import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useChatRoom } from "@/hooks/useChatRoom";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

type LayoutContext = { headerHeight: number; footerHeight: number };

export default function ChatWindow({ roomId }: { roomId: number }) {
  const { headerHeight, footerHeight } = useOutletContext<LayoutContext>();

  const {
    room, peer, msgs, status, send,
    bottomRef, listContainerRef, membersById,
    isDM, hasMore, loadingOlder, loadOlder,
  } = useChatRoom(roomId);

  const [inputHeight, setInputHeight] = useState(56);
  const peerName = useMemo(() => peer?.name ?? null, [peer]);

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
