// src/components/chat/MessageList.tsx
import type { MessageResponseDTO, MemberResponseDTO } from "@/types/chat";
import { useEffect, useCallback, useState } from "react";
import MessageItem from "./MessageItem";
import { userProfileUrl } from "@/utils/chat";
import { getCurrentUserId } from "@/api/authApi";

export default function MessageList({
  msgs,
  peerName,
  bottomRef,
  membersById = {},
  isDM = false,
  headerHeightPx = 0,
  footerHeightPx = 0,
  inputHeightPx = 56,
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
  headerHeightPx?: number;
  footerHeightPx?: number;
  inputHeightPx?: number;
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlder: () => Promise<void> | void;
}) {
  const [meId, setMeId] = useState<number | undefined>(undefined);
  useEffect(() => {
    getCurrentUserId().then(setMeId).catch(() => setMeId(undefined));
  }, []);

  // 무한스크롤: 위로 당기면 과거 로드
  const handleScroll = useCallback(() => {
    const el = listContainerRef.current;
    if (!el) return;
    if (el.scrollTop <= 80 && hasMore && !loadingOlder) loadOlder();
  }, [listContainerRef, hasMore, loadingOlder, loadOlder]);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll, listContainerRef]);

  return (
    <div
      ref={listContainerRef}
      className="w-full bg-[#fafafa] overflow-y-auto"
      style={{
        height: `calc(100dvh - ${headerHeightPx}px - ${footerHeightPx}px - ${inputHeightPx}px - env(safe-area-inset-bottom, 0px))`,
        paddingBottom: 0,
        overscrollBehavior: "contain",
      }}
    >
      <main className="w-full max-w-[768px] mx-auto px-4 box-border">
        {loadingOlder && (
          <div className="text-center text-xs text-gray-500 py-1">이전 메시지 불러오는 중…</div>
        )}

        {msgs.map((m, i) => {
          const prev = msgs[i - 1];

          // SYSTEM 메시지(입장/퇴장) 표시
          if (m.messageType === "SYSTEM") {
            return (
              <div key={m.messageId} className="w-full flex justify-center my-2">
                <span className="px-8 py-2 rounded-full text-sm text-gray-600 bg-gray-100">
                  {m.content}
                </span>
              </div>
            );
          }

          // 일반(TEXT) 메시지
          const isMine = m.senderId === meId;
          const isFirstOfBlock = !prev || prev.senderId !== m.senderId;
          const afterSystem = prev?.messageType === "SYSTEM";

          const member = m.senderId != null ? membersById[m.senderId] : undefined;
          const name =
            m.senderName ??
            member?.name ??
            (isMine ? "나" : isDM ? (peerName ?? "탈퇴한 사용자") : "탈퇴한 사용자");

          const avatar = userProfileUrl(m.senderId);

          return (
            <MessageItem
              key={m.messageId}
              m={m}
              isFirstOfBlock={isFirstOfBlock}
              showAvatar={!isMine && isFirstOfBlock}
              name={name}
              avatar={avatar}
              // 시스템 메시지 직후면 간격을 더 촘촘하게
              compactAfterSystem={afterSystem}
            />
          );
        })}

        <div ref={bottomRef} />
      </main>
    </div>
  );
}
