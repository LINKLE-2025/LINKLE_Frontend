import { useEffect, useMemo, useRef, useState } from "react";
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

  // 바닥 상태/변화 감지용
  const wasAtBottomRef = useRef(false);
  const prevFirstIdRef = useRef<number | undefined>(undefined);
  const prevLastIdRef = useRef<number | undefined>(undefined);
  const initialAutoScrollDoneRef = useRef(false);

  // [NEW] 메시지별 '읽은 유저' 집합(메모리 캐시): messageId -> Set<userId>
  const readByMapRef = useRef<Map<number, Set<number>>>(new Map());

  // 공용 하단 스크롤
  function scrollToBottom(mode: "instant" | "smooth" = "instant") {
    const el = listContainerRef.current;
    if (!el) return;

    const perform = () => {
      const prev = el.style.scrollBehavior;
      el.style.scrollBehavior = mode === "smooth" ? "smooth" : "auto";
      el.scrollTop = el.scrollHeight;
      el.style.scrollBehavior = prev;
      wasAtBottomRef.current = true;
    };

    // double rAF: DOM 업데이트와 레이아웃 확정 이후 실행
    requestAnimationFrame(() => {
      requestAnimationFrame(perform);
    });
  }

  // ★ 컨테이너/레이아웃이 준비될 때까지 재시도하며 1회 하단으로
  function ensureInitialScrollToBottom() {
    if (initialAutoScrollDoneRef.current) return;
    let tries = 0;
    const MAX_TRIES = 16; // 충분한 여유

    const tick = () => {
      const el = listContainerRef.current;
      if (el && el.scrollHeight > 0) {
        scrollToBottom("instant");
        initialAutoScrollDoneRef.current = true; // 성공했을 때만 true
        return;
      }
      if (tries++ < MAX_TRIES) requestAnimationFrame(tick);
    };

    // 레이아웃 → 페인트 이후에 시도
    requestAnimationFrame(() => requestAnimationFrame(tick));
  }

  // --- 먼저 선언: loadOlder ---
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
          .map((x) => {
            const content = x.content ?? (x as any).text ?? "";

            // sender를 '이미 읽은 사람'으로 씨딩
            const set = readByMapRef.current.get(x.messageId) ?? new Set<number>();
            if (typeof x.senderId === "number") set.add(x.senderId);
            readByMapRef.current.set(x.messageId, set);

            // 서버 readCount 없으면 set.size로 보강
            const rc = typeof (x as any).readCount === "number" ? (x as any).readCount : set.size;

            return {
              ...x,
              content,
              readCount: rc,
            } as MessageResponseDTO & { readCount?: number };
          })
          .filter((x) => x.messageType === "TEXT" || x.messageType === "SYSTEM")
          .filter((x) => typeof x.messageId === "number")
          .filter((x) => typeof x.content === "string" && x.content.trim().length > 0)
          .filter((x) => !ids.has(x.messageId))
          .sort(byCreatedAsc);

        return [...toPrepend, ...prev];
      });

      setHasMore(older.length === PAGE_SIZE);

      // 프리펜드 델타 보정 (보던 자리 유지)
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

        setPeer(
          partnerId != null
            ? {
                name: partner?.name ?? (r as any).friendName ?? "(상대)",
                nick: (r as any).dmPartnerNickname ?? partner?.nickname ?? String(partnerId),
                id: partnerId,
              }
            : { name: null, nick: null, id: null },
        );
      } else {
        setPeer({ name: r.roomName ?? "그룹 톡", nick: null, id: null });
      }

      // 기존 initial 생성 블록을 아래로 교체
      const initial = (m ?? [])
        .map((x) => {
          const content = x.content ?? (x as any).text ?? "";

          // sender를 '이미 읽은 사람'으로 씨딩
          const set = readByMapRef.current.get(x.messageId) ?? new Set<number>();
          if (typeof x.senderId === "number") set.add(x.senderId);
          readByMapRef.current.set(x.messageId, set);

          // 서버 readCount가 없으면 set.size로 보강
          const rc = typeof (x as any).readCount === "number" ? (x as any).readCount : set.size;

          return {
            ...x,
            content,
            readCount: rc,
          } as MessageResponseDTO & { readCount?: number };
        })
        .filter((x) => x.messageType === "TEXT" || x.messageType === "SYSTEM")
        .filter((x) => typeof x.messageId === "number")
        .filter((x) => typeof x.content === "string" && x.content.trim().length > 0)
        .sort(byCreatedAsc);

      setMsgs(initial);
      setHasMore((m ?? []).length === PAGE_SIZE);

      // ★ 초기 1회 확실한 하강 (컨테이너 준비될 때까지 재시도)
      ensureInitialScrollToBottom();

      // 초기 바닥 상태 기록 + append/prepend 비교 초기화
      const el = listContainerRef.current;
      if (el) wasAtBottomRef.current = isNearBottom(el, 8);
      prevFirstIdRef.current = initial[0]?.messageId;
      prevLastIdRef.current = initial[initial.length - 1]?.messageId;
    })().catch(console.error);
  }, [roomId]);

  // 혹시 렌더 순서 때문에 컨테이너가 늦게 잡히면 한 번 더 보증
  useEffect(() => {
    ensureInitialScrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listContainerRef.current]);

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

    const me = Number(DEV_UID) || null;

    const off = stompClient.subscribe(`/sub/room.${roomId}`, (raw: any) => {
      const rawType = (raw?.type ?? raw?.eventType ?? "") as string;
      const type = rawType.toString().toUpperCase();

      // [NEW] READ 이벤트 먼저 처리
      if (type.includes("READ")) {
        const readerId: number | undefined = raw?.readerId ?? raw?.userId ?? raw?.reader?.id;
        const lastReadMessageId: number | undefined = raw?.lastReadMessageId ?? raw?.lastReadMsgId;

        if (typeof readerId !== "number" || typeof lastReadMessageId !== "number") {
          return;
        }

        const readByMap = readByMapRef.current;

        // lastReadMessageId 이하 메시지에 대해 readerId 반영
        setMsgs((prev) => {
          let changed = false;
          const next = prev.map((m) => {
            if (m.messageId <= lastReadMessageId) {
              const set = readByMap.get(m.messageId) ?? new Set<number>();
              if (!set.has(readerId)) {
                set.add(readerId);
                readByMap.set(m.messageId, set);
                const newCount = set.size;
                changed = true;
                return { ...m, readCount: newCount }; // readCount 갱신
              }
            }
            return m;
          });
          return changed ? next : prev;
        });

        return;
      }

      // 메시지 생성 관련 이벤트만 통과
      if (type && type !== "MESSAGE_CREATED" && type !== "NEW_MESSAGE") return;

      const contentRaw = raw?.content ?? raw?.text ?? "";
      if (typeof raw?.messageId !== "number") return;
      if (typeof contentRaw !== "string" || contentRaw.trim().length === 0) return;

      const mt = (raw?.messageType as any) ?? "TEXT";
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
        // [NEW] 보낸 사람은 즉시 읽은 것으로 간주(원치 않으면 0으로 바꿔도 됨)
        readCount: 1,
      };

      // [NEW] 메모리 캐시에 보낸 사람을 reader로 기록
      if (typeof evt.senderId === "number") {
        const set = readByMapRef.current.get(evt.messageId) ?? new Set<number>();
        set.add(evt.senderId);
        readByMapRef.current.set(evt.messageId, set);
      }

      setMsgs((prev) => {
        if (prev.some((x) => x.messageId === evt.messageId)) return prev;
        const next = [...prev, evt].sort(byCreatedAsc);

        // 내가 보낸 메시지는 무조건 하강
        if (evt.senderId != null && me != null && evt.senderId === me) {
          scrollToBottom("smooth");
        }
        return next;
      });
    });

    return () => {
      try {
        off?.();
      } catch {}
    };
  }, [roomId]);

  // 스크롤 리스너: 바닥 상태 갱신 + 상단 임계치 로드
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      wasAtBottomRef.current = isNearBottom(el, 8);
      if (el.scrollTop <= 80 && hasMore && !loadingOlder) {
        loadOlder();
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingOlder, loadOlder]);

  // append/prepend 판별
  function detectAppendPrepend(nextMsgs: MessageResponseDTO[]) {
    const firstId = nextMsgs[0]?.messageId;
    const lastId = nextMsgs[nextMsgs.length - 1]?.messageId;
    const prevFirst = prevFirstIdRef.current;
    const prevLast = prevLastIdRef.current;

    // 다음 비교를 위해 갱신
    prevFirstIdRef.current = firstId;
    prevLastIdRef.current = lastId;

    if (prevFirst === undefined || prevLast === undefined) {
      return { isAppend: false, isPrepend: false };
    }
    const isPrepend = lastId === prevLast && firstId !== prevFirst; // 위에 추가됨
    const isAppend = firstId === prevFirst && lastId !== prevLast; // 아래에 추가됨
    return { isAppend, isPrepend };
  }

  // msgs 변화 시 자동 하강(조건부)
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const { isAppend, isPrepend } = detectAppendPrepend(msgs);

    if (loadingOlder || isPrepend) return;

    if (isAppend && wasAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      wasAtBottomRef.current = true;
    }
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

    // 송신 직후에도 하강 (브로드캐스트 지연 대비)
    scrollToBottom("smooth");
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
    [room, peer, msgs, status, membersById, isDM, hasMore, loadingOlder, loadOlder],
  );
}
