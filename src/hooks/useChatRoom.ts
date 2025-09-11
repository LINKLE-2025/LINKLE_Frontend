// useChatRoom.ts
import { useEffect, useMemo, useRef, useState } from "react";
import type { MemberResponseDTO, MessageResponseDTO, RoomResponseDTO } from "../types/chat";
import { resolveImageUrl } from "../utils/chat";
import apiClient from "../api/apiClient";
import { getCurrentUserId } from "../api/authApi";
import { stompClient } from "@/lib/stompClient";

const DEV_UID = await getCurrentUserId().catch(() => {});
const PAGE_SIZE = 30 as const;

// --- REST helpers (기존 유지) ---
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

  // 1) 초기 로드 (REST)
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
        .sort(byCreatedAsc);

      setMsgs(initial);
      setHasMore((m ?? []).length === PAGE_SIZE);
    })().catch(console.error);
  }, [roomId]);

  // 2) 전역 STOMP 상태 반영
  useEffect(() => {
    // 즉시 현재 상태 반영 + 변화 구독
    const off = stompClient.onStatusChange((s) => setStatus(s));
    return () => off();
  }, []);

  // 3) 방 토픽 구독 (전역 싱글톤 사용)
  useEffect(() => {
    if (!roomId) return;

    // 연결 여부와 무관하게 subscribe 호출 가능: 싱글톤이 내부에서 재연결 시 자동 재구독 처리
    const off = stompClient.subscribe(`/sub/room.${roomId}`, (raw) => {
      const evt: MessageResponseDTO = {
        messageId: raw?.messageId ?? Date.now(),
        roomId: raw?.roomId ?? roomId,
        messageType: raw?.messageType ?? "TEXT",
        content: raw?.content ?? raw?.text ?? "",
        createdDate: raw?.createdDate ?? new Date().toISOString(),
        senderId: raw?.senderId ?? raw?.userId ?? raw?.sender?.userId ?? null,
        senderName: raw?.senderName ?? raw?.sender?.name ?? null,
        senderImage: resolveImageUrl(raw?.senderImage ?? raw?.sender?.image) ?? null,
      };

      setMsgs((prev) => {
        if (prev.some((x) => x.messageId === evt.messageId)) return prev;
        return [...prev, evt].sort(byCreatedAsc);
      });
    });

    return () => off();
  }, [roomId]);

  // 4) 자동 스크롤 (기존 로직 유지)
  const isAtBottomRef = useRef(true);
  const firstLoadRef = useRef(true);
  const prevLastIdRef = useRef<number | null>(null);

  function getLastId(list: MessageResponseDTO[]) {
    return list.length ? list[list.length - 1].messageId : null;
  }
  function isNearBottom(el: HTMLElement) {
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance <= 24;
  }

  // 스크롤 이벤트에서 바닥 여부 갱신
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      isAtBottomRef.current = isNearBottom(el);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [listContainerRef]);

  // 메시지 변경 시 조건부 자동 스크롤
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const lastId = getLastId(msgs);

    // 1) 최초 1회: 무조건 아래로
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "instant" as any });
      prevLastIdRef.current = lastId;
      return;
    }

    // 2) 과거 로드 중이면 자동 스크롤 금지
    if (loadingOlder) {
      prevLastIdRef.current = lastId;
      return;
    }

    // 3) 신규 마지막 메시지 & 사용자가 바닥 근처일 때만 자동 스크롤
    const lastChanged = lastId != null && lastId !== prevLastIdRef.current;
    if (lastChanged && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLastIdRef.current = lastId;
  }, [msgs, loadingOlder, listContainerRef, bottomRef]);

  // 5) 발송 (전역 publish 사용)
  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    if (!stompClient.isConnected()) {
      console.warn("STOMP not connected");
      return;
    }
    stompClient.publish(
      "/app/message.send",
      { roomId, text: body },
      { "x-user-id": String(DEV_UID) },
    );
  };

  // 6) 과거 메시지 로드 (기존 유지)
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
