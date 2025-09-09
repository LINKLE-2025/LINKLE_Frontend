// src/components/chat/ChatWindow.tsx
import { useState } from "react";
import { useChatRoom } from "@/hooks/useChatRoom";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatWindow({ roomId }: { roomId: number }) {
  const {
    room,
    peer,
    msgs,
    status,
    send,
    bottomRef,
    listContainerRef,
    membersById,
    isDM,
    hasMore,
    loadingOlder,
    loadOlder,
  } = useChatRoom(roomId);

  const [inputHeight, setInputHeight] = useState(64);

  if (!room) return <div className='p-4'>Loading...</div>;

  return (
    <>
      <MessageList
        msgs={msgs}
        peerName={peer?.name ?? null}
        bottomRef={bottomRef}
        membersById={membersById}
        isDM={isDM}
        inputHeightPx={inputHeight}
        listContainerRef={listContainerRef}
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        loadOlder={loadOlder}
      />
      <ChatInput onSend={send} onHeightChange={setInputHeight} />
      {status !== "open" && (
        <div className='fixed left-1/2 -translate-x-1/2 bottom-20 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded'>
          {status === "connecting" ? "연결 중..." : status === "closed" ? "연결 종료" : "에러"}
        </div>
      )}
    </>
  );
}
