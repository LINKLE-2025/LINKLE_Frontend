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
import { useQueryClient } from "@tanstack/react-query";

export default function ChatWindow({ roomId }: { roomId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { headerHeight, footerHeight, setRoomHeader } =
    useOutletContext<ChatOutletContext>();

  const {
    room, peer, msgs, status, send,
    bottomRef, listContainerRef, membersById,
    isDM, hasMore, loadingOlder, loadOlder,
  } = useChatRoom(roomId);

  // 방 인원수 산정 (room.memberCount 우선 → membersById 개수 폴백)
  const memberCount = useMemo(() => {
    if (!room) return 0;

    // DM이면 항상 2명(나 + 상대)
    if (isDM) return 2;

    // 그룹: 탈퇴/비활성 제외하고 카운트
    const active = Object.values(membersById ?? {}).filter((m: any) => {
      const s = String(m?.state ?? "").toUpperCase();
      return s !== "LEFT" && s !== "INACTIVE" && s !== "WITHDRAWN";
    });

    // membersById가 비어있으면 room.memberCount를 폴백으로 사용
    const fromMap = active.length;
    const fromRoom = Number(room?.memberCount ?? 0);
    return fromMap > 0 ? fromMap : fromRoom;
  }, [isDM, room, membersById]);

  // ChatInput이 넘겨주는 값은 "입력바 높이 + 키보드/푸터" = 하단 점유 높이
  const [inputOccupiedPx, setInputOccupiedPx] = useState(56);

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

  // 하단 점유 높이가 바뀌면 리스트가 가려지지 않도록 하단으로 스크롤
  useEffect(() => {
    // 키보드가 올라오거나 내려갈 때 / 입력바 높이 변동 시
    // bottomRef(리스트 맨 아래 sentinel)를 뷰에 맞춰줌
    try {
      bottomRef?.current?.scrollIntoView({ block: "end" });
    } catch { }
  }, [inputOccupiedPx, bottomRef]);

  // 채팅방 나가기

  const handleLeave = async () => {
    try {
      // 1) 서버 퇴장
      await leaveRoom(roomId);

      // 2) 방 목록 캐시에서 즉시 제거 (배열/무한스크롤 모두 대응)
      queryClient.setQueryData(["chat", "rooms"], (old: unknown) => {
        // 배열 구조: Room[]
        if (Array.isArray(old)) {
          return old.filter((r: any) => r?.id !== roomId);
        }
        // 무한스크롤 구조: { pages: [{ items: Room[] }, ...], pageParams: [...] }
        if (old && typeof old === "object" && Array.isArray((old as any).pages)) {
          const inf = old as { pages: Array<{ items: any[] }>; pageParams: any[] };
          return {
            ...inf,
            pages: inf.pages.map((p) => ({
              ...p,
              items: (p.items ?? []).filter((r: any) => r?.id !== roomId),
            })),
          };
        }
        return old;
      });

      // 3) 해당 방 관련 캐시 정리
      queryClient.removeQueries({ queryKey: ["chat", "room", roomId] });
      queryClient.removeQueries({ queryKey: ["chat", "messages", roomId] });
      queryClient.removeQueries({ queryKey: ["chat", "members", roomId] });

      // 4) 리스트 재조회 트리거 (활성 뷰에서 즉시 refetch)
      await queryClient.invalidateQueries({
        queryKey: ["chat", "rooms"],
        refetchType: "active",
      });

      // 5) 리스트로 이동
      navigate("/chat", { replace: true });
    } catch (e) {
      console.error(e);
      alert("채팅방 나가기에 실패했어요.");
    } finally {
      setSheetOpen(false);
    }
  };
  if (!room) return;

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
        inputHeightPx={inputOccupiedPx}
        listContainerRef={listContainerRef}
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        loadOlder={loadOlder}
        memberCount={memberCount}
      />

      <ChatInput
        onSend={send}
        footerHeightPx={footerHeight}
        onHeightChange={setInputOccupiedPx}
        disabled={dmBlocked}
        disabledMessage="탈퇴한 사용자입니다"
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
        currentUserId={currentUserId}
      />
    </>
  );
}
