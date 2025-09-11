// src/hooks/useChatRoom.ts
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MemberResponseDTO, MessageResponseDTO, RoomResponseDTO } from "../types/chat";
import { resolveImageUrl } from "../utils/chat";
import apiClient from "../api/apiClient";
import { getCurrentUserId } from "../api/authApi";
import { stompClient } from "@/lib/stompClient";
import { useQueryClient } from "@tanstack/react-query";
import { markRead } from "@/api/chatApi";
import { setRoomUnreadZero } from "@/utils/chatRead";

const READ_DEBOUNCE_MS = 400 as const;
const DEV_UID = await getCurrentUserId().catch(() => {});
const PAGE_SIZE = 30 as const;

// --- REST helpers ---
async function getRoom(roomId: number) {
  const { data } = await apiClient.get<RoomResponseDTO>(`/chat/room/${roomId}`, {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}
async function getMessages(roomId: number, size = PAGE_SIZE) {
  const { data } = await apiClient.get<MessageResponseDTO[]>(`/chat/room/${roomId}/messages`, {
    params: { size },
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}
async function getMembers(roomId: number) {
  const { data } = await apiClient.get<MemberResponseDTO[]>(`/chat/room/${roomId}/members`, {
    headers: { "x-user-id": DEV_UID },
  });
  return data;
}

// --- utils ---
type SocketStatus = "connecting" | "open" | "closed" | "error";
type PeerInfo = { name: string; avatar?: string | null } | null;

function byCreatedAsc(a: MessageResponseDTO, b: MessageResponseDTO) {
  return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
}

function isNearBottom(el: HTMLElement, threshold = 24) {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

// --- hook ---
export function useChatRoom(roomId: number) {
  const [room, setRoom] = useState<RoomResponseDTO | null>(null);
  const [peer, setPeer] = useState<PeerInfo>(null);
  const [msgs, setMsgs] = useState<MessageResponseDTO[]>([]);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [membersById, setMembersById] = useState<Record<number, MemberResponseDTO>>({});
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const queryClient = useQueryClient();

  // 읽음 관리
  const lastAckedIdRef = useRef<number | null>(null);
  const readTimerRef = useRef<number | null>(null);

  // 초기 로드
  useEffect(() => {
    if (!roomId) return;

    (async () => {
      const [r, m] = await Promise.all([getRoom(roomId), getMessages(roomId, PAGE_SIZE)]);
      setRoom(r);

      if (r.roomType !== "DM") {
        try {
          const members = await getMembers(roomId);
          const map: Record<number, MemberResponseDTO> = {};
          members.forEach((u) => (map[u.userId] = u));
          setMembersById(map);
        } catch {
          setMembersById({});
        }
      }

      setPeer(
        r.roomType === "DM"
          ? {
              name: r.friendName ?? "(상대)",
              avatar: resolveImageUrl((r as any).friendImage) ?? null,
            }
          : { name: r.roomName ?? "그룹 채팅", avatar: null },
      );

      const initial = (m ?? [])
        .map((x) => ({ ...x, content: x.content ?? (x as any).text ?? "" }))
        .filter((x) => x.messageType === "TEXT")
        .filter((x) => typeof x.messageId === "number")
        .filter((x) => typeof x.content === "string" && x.content.trim().length > 0)
        .sort(byCreatedAsc);

      setMsgs(initial);
      setHasMore((m ?? []).length === PAGE_SIZE);
    })().catch(console.error);
  }, [roomId]);

  // STOMP 상태
  useEffect(() => {
    const off = stompClient.onStatusChange((s) => setStatus(s));
    return () => {
      try {
        off?.();
      } catch {}
    };
  }, []);

  // 방별 구독
  useEffect(() => {
    if (!roomId) return;

    const off = stompClient.subscribe(`/sub/room.${roomId}`, (raw: any) => {
      // 1) 이벤트 타입 식별
      const type = raw?.type ?? raw?.eventType ?? null;

      // 2) 메시지 이벤트만 통과 (예: MESSAGE_CREATED, NEW_MESSAGE)
      if (type && type !== "MESSAGE_CREATED" && type !== "NEW_MESSAGE") {
        return; // 읽음/타이핑/입장 등 무시
      }

      // 3) 내용/ID 검증 (빈 내용 메시지 방지)
      const contentRaw = raw?.content ?? raw?.text ?? "";
      if (typeof raw?.messageId !== "number") return;
      if (typeof contentRaw !== "string" || contentRaw.trim().length === 0) return;

      // 4) messageType도 TEXT만 통과
      const mt = (raw?.messageType as any) ?? "TEXT";
      if (mt !== "TEXT") return;

      const evt: MessageResponseDTO = {
        messageId: raw.messageId,
        roomId: raw.roomId ?? roomId,
        messageType: mt,
        content: contentRaw,
        createdDate: raw.createdDate ?? new Date().toISOString(),
        senderId: raw.senderId ?? raw.userId ?? raw.sender?.userId ?? null,
        senderName: raw.senderName ?? raw.sender?.name ?? null,
        senderImage: resolveImageUrl(raw.senderImage ?? raw.sender?.image) ?? null,
      };

      setMsgs((prev) => {
        if (prev.some((x) => x.messageId === evt.messageId)) return prev;
        return [...prev, evt].sort(byCreatedAsc);
      });
    });

    return () => {
      try {
        off?.();
      } catch {}
    };
  }, [roomId]);

  // --- 자동 스크롤 ---

  // 스크롤 이벤트로 "바닥 근처" 상태 추적 (필요 시 확장 가능)
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      /* 상태 추적이 필요하면 여기에 */
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ 최초 메시지 로드 후 확실히 맨 아래로
  useLayoutEffect(() => {
    if (!msgs.length) return;
    const el = listContainerRef.current;
    if (!el) return;

    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };

    // 즉시
    scrollToBottom();
    // 다음 프레임(레이아웃 확정 후)
    requestAnimationFrame(scrollToBottom);
    // 이미지/폰트 지연 로딩 대비
    const t = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(t);
  }, [roomId, msgs.length]);

  // ✅ 새 메시지 도착 시: 바닥 근처일 때만 자동으로 아래로
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    if (loadingOlder) return; // 과거 로드 중이면 금지

    if (isNearBottom(el)) {
      el.scrollTop = el.scrollHeight;
    }
  }, [msgs, loadingOlder]);

  // 메시지 전송 + 목록 캐시 업데이트
  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    if (!stompClient.isConnected()) {
      console.warn("STOMP not connected");
      return;
    }

    const now = new Date().toISOString();

    stompClient.publish(
      "/app/message.send",
      { roomId, text: body },
      { "x-user-id": String(DEV_UID) },
    );

    // ✅ 목록 캐시 갱신
    queryClient.setQueryData<RoomResponseDTO[]>(["chatRooms"], (prev) => {
      if (!prev) return prev;
      return prev.map((room) =>
        room.roomId === roomId
          ? {
              ...room,
              lastMessagePreview: body,
              lastMessageDate: now,
              unreadCount: 0,
            }
          : room,
      );
    });
  };

  // 과거 메시지 로드
  const loadOlder = async () => {
    if (loadingOlder || !hasMore || msgs.length === 0) return;

    setLoadingOlder(true);
    const oldest = msgs[0];

    const scroller =
      listContainerRef.current ?? document.scrollingElement ?? document.documentElement;
    const prevScrollHeight = scroller.scrollHeight;
    const prevScrollTop = scroller.scrollTop;

    try {
      const { data: older } = await apiClient.get<MessageResponseDTO[]>(
        `/chat/room/${roomId}/messages`,
        {
          params: { size: PAGE_SIZE, beforeId: oldest.messageId },
          headers: { "x-user-id": DEV_UID },
        },
      );

      setMsgs((prev) => {
        const ids = new Set(prev.map((x) => x.messageId));
        const toPrepend = older
          .map((x) => ({ ...x, content: x.content ?? (x as any).text ?? "" }))
          .filter((x) => x.messageType === "TEXT")
          .filter((x) => typeof x.messageId === "number")
          .filter((x) => typeof x.content === "string" && x.content.trim().length > 0)
          .filter((x) => !ids.has(x.messageId))
          .sort(byCreatedAsc);
        return [...toPrepend, ...prev];
      });

      setHasMore(older.length === PAGE_SIZE);

      requestAnimationFrame(() => {
        const newScrollHeight = scroller.scrollHeight;
        scroller.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      });
    } catch (e) {
      console.error("[loadOlder] failed", e);
    } finally {
      setLoadingOlder(false);
    }
  };

  // 읽음 동기화
  function getVisibleLastId(): number | null {
    const last = msgs.length ? msgs[msgs.length - 1] : null;
    return last ? last.messageId : null;
  }
  function scheduleReadSync(candId: number | null) {
    if (candId == null) return;
    if (lastAckedIdRef.current != null && candId <= lastAckedIdRef.current) return;

    if (readTimerRef.current) window.clearTimeout(readTimerRef.current);

    readTimerRef.current = window.setTimeout(async () => {
      if (lastAckedIdRef.current != null && candId <= lastAckedIdRef.current) return;
      try {
        setRoomUnreadZero(queryClient, roomId); // 캐시 낙관적 반영
        await markRead(roomId, candId);
        lastAckedIdRef.current = candId;
      } catch (e) {
        console.warn("[read-sync] failed", e);
      }
    }, READ_DEBOUNCE_MS) as unknown as number;
  }

  // 진입 직후
  useEffect(() => {
    if (!roomId || !msgs.length) return;
    scheduleReadSync(getVisibleLastId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, msgs.length]);

  // 스크롤 시
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distance <= 24) scheduleReadSync(getVisibleLastId());
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [listContainerRef, msgs]);

  // 새 메시지 도착 시
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distance <= 24) scheduleReadSync(getVisibleLastId());
  }, [msgs]);

  // 포커스/언마운트 시
  useEffect(() => {
    const onVis = () => scheduleReadSync(getVisibleLastId());
    const onBlur = () => scheduleReadSync(getVisibleLastId());
    const onFocus = () => scheduleReadSync(getVisibleLastId());

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      scheduleReadSync(getVisibleLastId()); // 마지막 시도
      if (readTimerRef.current) window.clearTimeout(readTimerRef.current);
    };
  }, [roomId, msgs]);

  const isDM = room?.roomType === "DM";

  return useMemo(
    () => ({
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
    }),
    [room, peer, msgs, status, membersById, isDM, hasMore, loadingOlder],
  );
}
