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

// REST
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

// types
type SocketStatus = "connecting" | "open" | "closed" | "error";
type PeerInfo = { name: string; nick?: string | null; id?: number | null } | null;

function byCreatedAsc(a: MessageResponseDTO, b: MessageResponseDTO) {
  return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
}
function isNearBottom(el: HTMLElement, threshold = 24) {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

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

  const lastAckedIdRef = useRef<number | null>(null);
  const readTimerRef = useRef<number | null>(null);

  // 초기 로드
  useEffect(() => {
    if (!roomId) return;

    (async () => {
      const [r, m] = await Promise.all([getRoom(roomId), getMessages(roomId, PAGE_SIZE)]);

      // 멤버 조회는 실패해도 진행
      let mem: MemberResponseDTO[] = [];
      try {
        mem = await getMembers(roomId);
      } catch {
        mem = [];
      }

      setRoom(r);

      // membersById 구성
      const map: Record<number, MemberResponseDTO> = {};
      (mem ?? []).forEach((u) => {
        if (typeof u?.userId === "number") map[u.userId] = u;
      });
      setMembersById(map);

      if (String(r.roomType).toUpperCase() === "DM") {
        const me = Number(DEV_UID);
        const partner = (mem ?? []).find((u) => u.userId !== me) ?? null;
        const partnerId = partner?.userId ?? (r as any).friendUserId ?? null;

        // 상대가 없으면 "탈퇴한 사용자"로 안전표시
        setPeer(
          partnerId != null
            ? {
                name: partner?.name ?? (r as any).friendName ?? "(상대)",
                nick: (r as any).dmPartnerNickname ?? partner?.nickname ?? String(partnerId),
                id: partnerId,
              }
            : {
                name: "탈퇴한 사용자",
                nick: null,
                id: null,
              },
        );
      } else {
        setPeer({ name: r.roomName ?? "그룹 톡", nick: null, id: null });
      }

      const initial = (m ?? [])
        .map((x) => ({ ...x, content: x.content ?? (x as any).text ?? "" }))
        .filter((x) => x.messageType === "TEXT" || x.messageType === "SYSTEM")
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
      const type = raw?.type ?? raw?.eventType ?? null;
      if (type && type !== "MESSAGE_CREATED" && type !== "NEW_MESSAGE") return;

      const contentRaw = raw?.content ?? raw?.text ?? "";
      if (typeof raw?.messageId !== "number") return;
      if (typeof contentRaw !== "string" || contentRaw.trim().length === 0) return;

      const mt = (raw?.messageType as any) ?? "TEXT";
      // TEXT, SYSTEM만 통과
      if (mt !== "TEXT" && mt !== "SYSTEM") return;

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

      setMsgs((prev) =>
        prev.some((x) => x.messageId === evt.messageId) ? prev : [...prev, evt].sort(byCreatedAsc),
      );
    });

    return () => {
      try {
        off?.();
      } catch {}
    };
  }, [roomId]);

  // 스크롤 & 자동스크롤
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const onScroll = () => {};
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (!msgs.length) return;
    const el = listContainerRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
    const t = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(t);
  }, [roomId, msgs.length]);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el || loadingOlder) return;
    if (isNearBottom(el)) el.scrollTop = el.scrollHeight;
  }, [msgs, loadingOlder]);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    if (!stompClient.isConnected()) return console.warn("STOMP not connected");

    const now = new Date().toISOString();
    stompClient.publish(
      "/app/message.send",
      { roomId, text: body },
      { "x-user-id": String(DEV_UID) },
    );

    queryClient.setQueryData<RoomResponseDTO[]>(["chatRooms"], (prev) =>
      !prev
        ? prev
        : prev.map((r) =>
            r.roomId === roomId
              ? { ...r, lastMessagePreview: body, lastMessageDate: now, unreadCount: 0 }
              : r,
          ),
    );
  };

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
          // TEXT + SYSTEM 모두
          .filter((x) => x.messageType === "TEXT" || x.messageType === "SYSTEM")
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
        setRoomUnreadZero(queryClient, roomId);
        await markRead(roomId, candId);
        lastAckedIdRef.current = candId;
      } catch (e) {
        console.warn("[read-sync] failed", e);
      }
    }, READ_DEBOUNCE_MS) as unknown as number;
  }
  useEffect(() => {
    if (!roomId || !msgs.length) return;
    scheduleReadSync(getVisibleLastId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, msgs.length]);
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
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distance <= 24) scheduleReadSync(getVisibleLastId());
  }, [msgs]);
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
      scheduleReadSync(getVisibleLastId());
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
