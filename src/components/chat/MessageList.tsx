import type { MessageResponseDTO, MemberResponseDTO } from "../../types/chat";
import MessageItem from "./MessageItem";
import { useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_SERVER as string;

function userProfileUrl(userId?: number | null) {
  return typeof userId === "number" && userId > 0
    ? `${API_BASE}/api/user/view/profile/${userId}`
    : "";
}

export default function MessageList({
  msgs,
  peerName,
  bottomRef,
  membersById = {},
  isDM = false,
  inputHeightPx = 64,
  listContainerRef,
  hasMore,
  loadingOlder,
  loadOlder,
}: {
  msgs: MessageResponseDTO[];
  peerName?: string | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  membersById?: Record<number, MemberResponseDTO>;
  isDM?: boolean;
  inputHeightPx?: number;
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlder: () => void;
}) {
  const devUid = Number(import.meta.env.VITE_DEV_USER_ID ?? "2");

  const handleScroll = useCallback(() => {
    const el = listContainerRef.current ?? document.scrollingElement ?? document.documentElement;
    if (!el) return;
    if (el.scrollTop <= 80 && hasMore && !loadingOlder) loadOlder();
  }, [listContainerRef, hasMore, loadingOlder, loadOlder]);

  useEffect(() => {
    const el = listContainerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, listContainerRef]);

  return (
    <main
      ref={listContainerRef}
      className='w-full max-w-[768px] mx-auto px-4 py-2 bg-[#fafafa] min-h-full box-border overflow-y-auto'
      style={{
        paddingBottom: `calc(${inputHeightPx}px + 24px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {loadingOlder && (
        <div className='text-center text-xs text-gray-500 py-1'>이전 메시지 불러오는 중…</div>
      )}

      {msgs.map((m, i) => {
        const prev = msgs[i - 1];
        const isMine = m.senderId === devUid;

        // 블록 첫 메시지 판단
        const isFirstOfBlock = !prev || prev.senderId !== m.senderId;

        // 이름 계산
        const member = m.senderId != null ? membersById[m.senderId] : undefined;
        const name =
          m.senderName ?? member?.name ?? (isMine ? "나" : isDM ? (peerName ?? "상대") : "상대");

        // 아바타: userId 기반 서버 엔드포인트 사용
        const avatar = userProfileUrl(m.senderId);

        return (
          <MessageItem
            key={m.messageId}
            m={m}
            isFirstOfBlock={isFirstOfBlock}
            showAvatar={!isMine && isFirstOfBlock} // 상대 첫 메시지에만 아바타
            name={name}
            avatar={avatar}
          />
        );
      })}
      <div ref={bottomRef} />
    </main>
  );
}
