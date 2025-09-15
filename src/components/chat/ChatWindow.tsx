// src/components/chat/ChatWindow.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useChatRoom } from "@/hooks/useChatRoom";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatOutletContext } from "@/layouts/ChatLayout";

// ▼ 사이드 시트 & 나가기 API
import RoomMemberSheet from "./RoomMemberSheet";          // 경로는 사용하는 위치에 맞게 조정
import { leaveRoom } from "@/api/chatApi";
import RoomMemoModal from "../modal/RoomMemoModal";

export default function ChatWindow({ roomId }: { roomId: number }) {
  const navigate = useNavigate();
  const { headerHeight, footerHeight, setRoomHeader } =
    useOutletContext<ChatOutletContext>();

  const {
    room, peer, msgs, status, send,
    bottomRef, listContainerRef, membersById,
    isDM, hasMore, loadingOlder, loadOlder,
  } = useChatRoom(roomId);

  const [inputHeight, setInputHeight] = useState(56);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);

  const peerName = useMemo(() => peer?.name ?? null, [peer]);
  const members = useMemo(() => Object.values(membersById ?? {}), [membersById]);

  // 헤더 구성 + 메뉴(⋯) 클릭 → 사이드시트 열기
  useEffect(() => {
    if (!room) return;

    const onMenuClick = () => setSheetOpen((v) => !v);

    if (room.roomType === "DM") {
      setRoomHeader({
        room,
        dmName: peer?.name ?? room.friendName ?? null,
        dmNick:
          (room as any).dmPartnerNickname
          ?? (peer?.nick ?? (room.friendUserId != null ? String(room.friendUserId) : null)),
        dmUserId: (peer as any)?.id ?? room.friendUserId ?? null, // 사진용 id
        onMenuClick,
      });
    } else {
      setRoomHeader({ room, onMenuClick });
    }

    return () => setRoomHeader(null);
  }, [room, peer, setRoomHeader]);

  // 채팅방 나가기
  const handleLeave = async () => {
    try {
      await leaveRoom(roomId);
      navigate("/chat");
    } catch (e) {
      console.error(e);
      alert("채팅방 나가기에 실패했어요.");
    } finally {
      setSheetOpen(false);
    }
  };

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

      {/* 우측 참여자 패널 */}
      <RoomMemberSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        room={room}
        members={members}
        onLeave={handleLeave}
        headerHeight={headerHeight}
        footerHeight={footerHeight}
      />
      <RoomMemoModal
        room={room}
        isOpen={memoOpen}
        onClose={() => setMemoOpen(false)}
      />
      {status !== "open" && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          {status === "connecting" ? "연결 중..." : status === "closed" ? "연결 종료" : "에러"}
        </div>
      )}
    </>
  );
}
