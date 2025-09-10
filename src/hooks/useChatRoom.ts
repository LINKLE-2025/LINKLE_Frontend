import { useEffect, useMemo, useRef, useState } from "react";
import { Client, IFrame } from "@stomp/stompjs";
import type { MemberResponseDTO, MessageResponseDTO, RoomResponseDTO } from "../types/chat";
import { resolveImageUrl } from "../utils/chat";
import apiClient from "../api/apiClient";
import { getCurrentUserId } from "../api/authApi";

const WS_URL = import.meta.env.VITE_WS_URL as string;
const DEV_UID = await getCurrentUserId().catch(() => {});

const PAGE_SIZE = 30 as const;

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

export type PeerInfo = { name: string; avatar?: string | null } | null;
export type SocketStatus = "connecting" | "open" | "closed" | "error";

function byCreatedAsc(a: MessageResponseDTO, b: MessageResponseDTO) {
  return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
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

  const clientRef = useRef(
    new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 2000,
      debug: () => {},
    }),
  );

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

      if (r.roomType === "DM") {
        setPeer({
          name: r.friendName ?? "(상대)",
          avatar: resolveImageUrl((r as any).friendImage) ?? null,
        });
      } else {
        setPeer({ name: r.roomName ?? "그룹 채팅", avatar: null });
      }

      const initial = (m ?? [])
        .map((x) => ({ ...x, content: x.content ?? (x as any).text ?? "" }))
        .sort(byCreatedAsc);

      setMsgs(initial);
      setHasMore((m ?? []).length === PAGE_SIZE);
    })().catch(console.error);

    // STOMP
    const client = clientRef.current;
    client.onConnect = (_frame: IFrame) => {
      setStatus("open");
      client.subscribe(`/sub/room.${roomId}`, (frame) => {
        const raw = JSON.parse(frame.body);
        const evt: MessageResponseDTO = {
          messageId: raw.messageId ?? Date.now(),
          roomId: raw.roomId ?? roomId,
          messageType: raw.messageType ?? "TEXT",
          content: raw.content ?? raw.text ?? "",
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
    };
    client.onStompError = () => setStatus("error");
    client.onWebSocketError = () => setStatus("error");
    client.onWebSocketClose = () => setStatus("closed");

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [roomId]);

  // 새 메시지면 하단으로
  // useChatRoom.ts (추가)
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

  //  기존 "msgs 바뀌면 무조건 아래로" 이펙트 삭제하고, 아래로 대체
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const lastId = getLastId(msgs);

    // 1) 최초 로드: 한 번만 무조건 아래로
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "instant" as any });
      prevLastIdRef.current = lastId;
      return;
    }

    // 2) 과거 로드 중에는 자동 스크롤 금지
    if (loadingOlder) {
      prevLastIdRef.current = lastId;
      return;
    }

    // 3) "새로운 마지막 메시지"가 생겼고, 사용자가 바닥 근처일 때만 자동 스크롤
    const lastChanged = lastId != null && lastId !== prevLastIdRef.current;
    if (lastChanged && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLastIdRef.current = lastId;
  }, [msgs, loadingOlder, listContainerRef, bottomRef]);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    const c = clientRef.current;
    if (!c.connected) {
      console.warn("STOMP not connected");
      return;
    }
    c.publish({
      destination: "/app/message.send",
      headers: { "x-user-id": DEV_UID },
      body: JSON.stringify({ roomId, text: body }),
    });
  };

  // 과거 메시지 로드
  const loadOlder = async () => {
    if (loadingOlder || !hasMore) return;
    if (msgs.length === 0) return;

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
          params: {
            size: PAGE_SIZE,
            beforeId: oldest.messageId,
          },
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
