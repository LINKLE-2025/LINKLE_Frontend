// src/components/chat/MessageList.tsx
import type { MessageResponseDTO, MemberResponseDTO } from "@/types/chat";
import React, { useEffect, useCallback, useRef, useState } from "react";
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

  // 상단 로딩 재진입 방지
  const loadingUpRef = useRef(false);

  // 자동 하강 여부 판단용: 직전 바닥 상태
  const wasAtBottomRef = useRef(false);

  // 직전 메시지 경계(append/prepend 판별)
  const prevFirstIdRef = useRef<number | undefined>(undefined);
  const prevLastIdRef = useRef<number | undefined>(undefined);

  // mount 시 실제 바닥 상태로 초기화 (초기 true 금지!)
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    wasAtBottomRef.current = atBottom;
  }, [listContainerRef]);

  // append / prepend 감지
  const detectAppendPrepend = useCallback(() => {
    const firstId = msgs[0]?.messageId;
    const lastId = msgs[msgs.length - 1]?.messageId;

    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;

    // 초기 렌더 또는 비교 불가 시
    if (prevFirst === undefined || prevLast === undefined) {
      prevFirstIdRef.current = firstId;
      prevLastIdRef.current = lastId;
      return { isAppend: false, isPrepend: false };
    }

    // prepend: 마지막은 그대로, 첫 번째만 바뀜(위로 과거 추가)
    const isPrepend = lastId === prevLast && firstId !== prevFirst;

    // append: 첫 번째는 그대로, 마지막만 바뀜(아래로 새 메시지 추가)
    const isAppend = firstId === prevFirst && lastId !== prevLast;

    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;

    return { isAppend, isPrepend };
  }, [msgs]);

  // 스크롤 이벤트: 상단 임계 진입 시 과거 로드 + 위치 보정
  const handleScroll = useCallback(() => {
    const el = listContainerRef.current;
    if (!el) return;

    // 현재 바닥 여부를 매 스크롤 시 업데이트 (append 시 자동 하강 판단에만 사용)
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    wasAtBottomRef.current = atBottom;

    if (el.scrollTop <= 80 && hasMore && !loadingOlder && !loadingUpRef.current) {
      loadingUpRef.current = true;

      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;

      const prevBehavior = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto";

      Promise.resolve(loadOlder())
        .catch(() => void 0)
        .finally(() => {
          requestAnimationFrame(() => {
            const newScrollHeight = el.scrollHeight;
            const delta = newScrollHeight - prevScrollHeight;
            el.scrollTop = prevScrollTop + delta; // 시각적 위치 유지
            el.style.scrollBehavior = prevBehavior;
            loadingUpRef.current = false;
          });
        });
    }
  }, [listContainerRef, hasMore, loadingOlder, loadOlder]);

  // 스크롤 리스너 등록
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll, listContainerRef]);

  /**
   * msgs 변경 시 자동 하강 로직:
   * - prepend(과거 로드)거나 loadingOlder면 절대 하강 금지
   * - append(새 메시지 도착)일 때 & 직전에 바닥에 있었을 때만 하강
   */
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const { isAppend, isPrepend } = detectAppendPrepend();

    if (loadingOlder || isPrepend) {
      // 과거 로드 중/직후엔 절대 바닥으로 보내지 않음
      return;
    }

    if (isAppend && wasAtBottomRef.current) {
      bottomRef.current?.scrollIntoView?.({ block: "end" });
      // 하강 후에도 실제 바닥 상태 다시 기록
      const atBottomNow = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
      wasAtBottomRef.current = atBottomNow;
    }
    // append가 아니면 아무 것도 하지 않음 (길이 동일 변경 등)
  }, [msgs, loadingOlder, bottomRef, listContainerRef, detectAppendPrepend]);

  return (
    <div
      ref={listContainerRef}
      className="w-full bg-[#fafafa] overflow-y-auto"
      style={{
        height: `calc(100dvh - ${headerHeightPx}px - ${inputHeightPx}px - env(safe-area-inset-bottom, 0px))`,
        paddingBottom: 0,
        overscrollBehavior: "contain",
      }}
    >
      <main
        className="w-full max-w-[768px] mx-auto px-4 box-border"
        style={{ overflowAnchor: "auto" }}
      >
        {loadingOlder && (
          <div
            className="text-center text-xs text-gray-500 py-1"
            style={{ overflowAnchor: "none" }}
          >
            이전 메시지 불러오는 중…
          </div>
        )}

        {msgs.map((m, i) => {
          const prev = msgs[i - 1];

          if (m.messageType === "SYSTEM") {
            return (
              <div key={m.messageId} className="w-full flex justify-center my-2">
                <span className="px-8 py-2 rounded-full text-sm text-gray-600 bg-gray-100">
                  {m.content}
                </span>
              </div>
            );
          }

          const isMine = m.senderId === meId;
          const isFirstOfBlock = !prev || prev.senderId !== m.senderId;
          const afterSystem = prev?.messageType === "SYSTEM";

          const member: MemberResponseDTO | undefined =
            m.senderId != null ? membersById[m.senderId] : undefined;

          const name =
            m.senderName ??
            member?.name ??
            (isMine ? "나" : isDM ? peerName ?? "탈퇴한 사용자" : "탈퇴한 사용자");

          const avatar =
            !isMine && m.senderId != null && m.senderId > 0 ? userProfileUrl(m.senderId) : undefined;

          const gender = !isMine ? member?.gender ?? null : null;

          const withdrawn =
            !isMine && !member ? ((m.senderId ?? 0) === 0 || (name ?? "").includes("탈퇴")) : false;

          return (
            <MessageItem
              key={m.messageId}
              m={m}
              isFirstOfBlock={isFirstOfBlock}
              showAvatar={!isMine && isFirstOfBlock}
              name={name}
              avatar={avatar}
              gender={gender}
              withdrawn={withdrawn}
              compactAfterSystem={afterSystem}
            />
          );
        })}

        <div ref={bottomRef} />
      </main>
    </div>
  );
}
