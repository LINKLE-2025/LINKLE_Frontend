import { useEffect, useMemo, useRef, useState } from "react";
import { Client, IFrame } from "@stomp/stompjs";
import type { MemberResponseDTO, MessageResponseDTO, RoomResponseDTO } from "../types/chat";
import { resolveImageUrl } from "../utils/chat";

const API_BASE = import.meta.env.VITE_API_SERVER as string;
const WS_URL = import.meta.env.VITE_WS_URL as string;
const DEV_UID = String(import.meta.env.VITE_DEV_USER_ID ?? "2");

const PAGE_SIZE = 30 as const;

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: { "x-user-id": DEV_UID, Accept: "application/json" },
    credentials: "include",
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
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

  // 페이지네이션 상태
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
      const [r, m] = await Promise.all([
        fetchJSON<RoomResponseDTO>(`${API_BASE}/chat/room/${roomId}`),
        fetchJSON<MessageResponseDTO[]>(
          `${API_BASE}/chat/room/${roomId}/messages?size=${PAGE_SIZE}`,
        ),
      ]);

      setRoom(r);

      if (r.roomType !== "DM") {
        try {
          const members = await fetchJSON<MemberResponseDTO[]>(
            `${API_BASE}/chat/room/${roomId}/members`,
          );
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

      // 상태는 항상 "오름차순"
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
        // 중복 방지 + 오름차순 유지
        setMsgs((prev) => {
          if (prev.some((x) => x.messageId === evt.messageId)) return prev;
          const next = [...prev, evt].sort(byCreatedAsc);
          return next;
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
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

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

    const oldest = msgs[0]; // 오름차순이므로 맨 앞이 가장 과거
    const beforeDate = oldest.createdDate;
    const beforeId = oldest.messageId;

    const scroller =
      listContainerRef.current ?? document.scrollingElement ?? document.documentElement;
    const prevScrollHeight = scroller.scrollHeight;
    const prevScrollTop = scroller.scrollTop;

    try {
      // 서버가 모르는 파라미터는 무시하므로 둘 다 붙입니다.
      const url =
        `${API_BASE}/chat/room/${roomId}/messages?size=${PAGE_SIZE}` +
        `&beforeDate=${encodeURIComponent(beforeDate)}` +
        `&beforeId=${encodeURIComponent(String(beforeId))}`;

      const older = await fetchJSON<MessageResponseDTO[]>(url);

      setMsgs((prev) => {
        const ids = new Set(prev.map((x) => x.messageId));
        const toPrepend = older
          .map((x) => ({ ...x, content: x.content ?? (x as any).text ?? "" }))
          .filter((x) => !ids.has(x.messageId))
          .sort(byCreatedAsc); // 앞에 붙일 것도 오름차순
        return [...toPrepend, ...prev]; // 과거를 "앞"에 붙임
      });

      setHasMore(older.length === PAGE_SIZE);

      // 스크롤 위치 보정 (사용자는 같은 위치 유지)
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
