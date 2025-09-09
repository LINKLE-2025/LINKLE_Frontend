// src/components/chat/MessageList.tsx
import type { MessageResponseDTO, MemberResponseDTO } from "@/types/chat";
import { useEffect, useCallback } from "react";
import MessageItem from "./MessageItem";
import { userProfileUrl } from "@/utils/chat";

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
  loadOlder: () => Promise<void> | void;
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

        const isFirstOfBlock = !prev || prev.senderId !== m.senderId;

        const member = m.senderId != null ? membersById[m.senderId] : undefined;
        const name =
          m.senderName ?? member?.name ?? (isMine ? "나" : isDM ? (peerName ?? "상대") : "상대");

        const avatar = userProfileUrl(m.senderId);

        return (
          <MessageItem
            key={m.messageId}
            m={m}
            isFirstOfBlock={isFirstOfBlock}
            showAvatar={!isMine && isFirstOfBlock}
            name={name}
            avatar={avatar}
          />
        );
      })}
      <div ref={bottomRef} />
    </main>
  );
}
