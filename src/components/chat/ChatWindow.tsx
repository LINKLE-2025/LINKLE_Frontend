// src/components/chat/ChatWindow.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useChatRoom } from "@/hooks/useChatRoom";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatOutletContext } from "@/layouts/ChatLayout";

// 사이드 시트 & 나가기 API
import RoomMemberSheet from "./RoomMemberSheet";
import { leaveRoom } from "@/api/chatApi";
import { getCurrentUserInfo } from "@/api/authApi";

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
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  const peerName = useMemo(() => peer?.name ?? null, [peer]);
  const members = useMemo(() => Object.values(membersById ?? {}), [membersById]);

  // DM에서 상대가 탈퇴했는지 판단
  const dmBlocked = useMemo(() => {
    const fromDto = (room as any)?.isDmBlocked === true;
    const partnerIdIsZero =
      (room as any)?.friendUserId === 0 || (peer as any)?.id === 0;
    const nameIsPlaceholder =
      peerName === "(탈퇴한 사용자)" || (room as any)?.friendName === "(탈퇴한 사용자)";
    return isDM && (fromDto || partnerIdIsZero || nameIsPlaceholder);
  }, [isDM, room, peer, peerName]);

  // 현재 로그인 유저 ID 로드 (아이콘/정렬용)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { userId } = await getCurrentUserInfo();
        if (mounted && typeof userId === "number") setCurrentUserId(userId);
      } catch {
        setCurrentUserId(undefined);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 헤더 구성: 시트 열림 여부(sheetOpen)를 menuOpen으로 넘겨서 헤더 아이콘 토글
  useEffect(() => {
    if (!room) return;

    const onMenuClick = () => setSheetOpen(v => !v);

    if (room.roomType === "DM") {
      (setRoomHeader as any)({
        room,
        dmName: peer?.name ?? room.friendName ?? null,
        dmNick:
          (room as any).dmPartnerNickname
          ?? (peer?.nick ?? (room.friendUserId != null ? String(room.friendUserId) : null)),
        dmUserId: (peer as any)?.id ?? room.friendUserId ?? null,
        onMenuClick,
        menuOpen: sheetOpen,
        menuAriaLabel: sheetOpen ? "닫기" : "메뉴 열기",
      });
    } else {
      (setRoomHeader as any)({
        room,
        onMenuClick,
        menuOpen: sheetOpen,
        menuAriaLabel: sheetOpen ? "닫기" : "메뉴 열기",
      });
    }

    // 클린업: 언마운트 시 헤더 초기화
    return () => setRoomHeader(null);
  }, [room, peer, setRoomHeader, sheetOpen]);

  // 채팅방 나가기
  const handleLeave = async () => {
    try {
      await leaveRoom(roomId);
      navigate("/chat");
    } catch (e) {
      console.error(e);
      alert("채팅방 나가기에 실패했어요.");
    } finally {
      setSheetOpen(false); // 닫으면서 아이콘도 ⋯ 로 복귀
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
        disabled={dmBlocked}
        disabledMessage="탈퇴한 사용자입니다"
      />

      {/* 우측 참여자 패널 */}
      <RoomMemberSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}  // 닫히면 menuOpen도 false로 토글
        room={room}
        members={members}
        onLeave={handleLeave}
        headerHeight={headerHeight}
        footerHeight={footerHeight}
        currentUserId={currentUserId}
      />

      {status !== "open" && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          {status === "connecting" ? "연결 중..." : status === "closed" ? "연결 종료" : "에러"}
        </div>
      )}
    </>
  );
}
