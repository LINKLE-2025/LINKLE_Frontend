// src/hooks/useRoomUpdates.ts
import { useEffect, useRef } from "react";
import { useQueryClient, Query } from "@tanstack/react-query";
import { stompClient } from "@/lib/stompClient";
import { useAuthStore } from "@/store/authStore";
import type { RoomResponseDTO } from "@/types/chat";

export default function useRoomUpdates() {
  const me = useAuthStore((s) => s.user?.userId);
  const qc = useQueryClient();

  // roomId → latest seq/version 기록 (늦게 온 이벤트 무시)
  const latestSeqRef = useRef<Record<number, number>>({});

  // 현재 rooms 스냅샷 받기
  const getRooms = () =>
    (qc.getQueryData<RoomResponseDTO[]>(["chatRooms"]) ?? []) as RoomResponseDTO[];

  // 부분 패치 헬퍼
  const patchRoom = (roomId: number, patch: Partial<RoomResponseDTO>) => {
    qc.setQueryData<RoomResponseDTO[] | undefined>(["chatRooms"], (prev) => {
      if (!prev) return prev;
      let changed = false;
      const next = prev.map((r) => {
        if (r.roomId !== roomId) return r;
        changed = true;
        return { ...r, ...patch };
      });
      return changed ? next : prev;
    });
  };

  const applyPreviewAndUnread = (
    roomId: number,
    preview?: string | null,
    date?: string | null,
    unread?: number | null,
  ) => {
    qc.setQueryData<RoomResponseDTO[] | undefined>(["chatRooms"], (prev) => {
      if (!prev) return prev;
      let changed = false;
      const next = prev.map((r0) => {
        if (r0.roomId !== roomId) return r0;
        const r = { ...r0 };
        if (typeof preview === "string") r.lastMessagePreview = preview;
        if (typeof date === "string") r.lastMessageDate = date;
        if (typeof unread === "number") r.unreadCount = Math.max(0, unread);
        if (
          r.lastMessagePreview !== r0.lastMessagePreview ||
          r.lastMessageDate !== r0.lastMessageDate ||
          r.unreadCount !== r0.unreadCount
        ) {
          changed = true;
          return r;
        }
        return r0;
      });
      return changed ? next : prev;
    });
  };

  // ===== 유저 토픽: 서버가 unread/미리보기 푸시 =====
  useEffect(() => {
    if (!me) return;

    const off = stompClient.subscribe(`/sub/users.${me}.room-updates`, (p: any) => {
      const rid = Number(p?.roomId);
      if (!Number.isFinite(rid)) return;

      const seqCand = p?.seq ?? p?.version ?? p?.lastMessageId ?? p?.lastEventSeq;
      const seqNum = Number(seqCand);
      if (Number.isFinite(seqNum)) {
        const cur = latestSeqRef.current[rid] ?? -Infinity;
        if (seqNum <= cur) return;
        latestSeqRef.current[rid] = seqNum;
      }

      const type = String(p?.type ?? p?.eventType ?? "").toLowerCase();

      // unread 직접 값
      if (typeof p?.unreadCount === "number") {
        applyPreviewAndUnread(
          rid,
          p?.lastMessagePreview ?? p?.preview ?? null,
          p?.lastMessageDate ?? p?.date ?? null,
          p.unreadCount,
        );
        return;
      }

      // 내가 읽었을 때 0 처리
      if (type.includes("read") || type.includes("ack")) {
        const readerId = p?.readerId ?? p?.userId ?? p?.reader?.id;
        if (typeof readerId === "number" && readerId === me) {
          patchRoom(rid, { unreadCount: 0 });
        }
        return;
      }

      // 마지막 메시지 정보만 갱신
      if (type.includes("lastmessage")) {
        const preview = p?.lastMessagePreview ?? p?.preview ?? p?.text ?? null;
        const date = p?.lastMessageDate ?? p?.date ?? p?.createdDate ?? null;
        applyPreviewAndUnread(rid, preview, date, null);
        return;
      }
    });

    return () => {
      try {
        off?.();
      } catch {}
    };
  }, [me, qc]);

  // ===== 방 토픽: 새 메시지(+1) / 내가 읽음(0) =====
  const roomSubsRef = useRef<Map<number, () => void>>(new Map());

  // 방 구독을 캐시 변화에 맞춰 증분 갱신
  useEffect(() => {
    if (!me) return;

    // 최초 한 번 현재 rooms로 구독 시도
    const syncSubscriptions = () => {
      const rooms = getRooms();
      const subs = roomSubsRef.current;

      // 신규 방 구독
      for (const r of rooms) {
        const rid = r.roomId;
        if (subs.has(rid)) continue;

        const off = stompClient.subscribe(`/sub/room.${rid}`, (evt: any) => {
          // 유연한 새 메시지 판별: type이 없더라도 messageId + (text|content)이면 메시지
          const typeRaw = String(evt?.type ?? evt?.eventType ?? "").toLowerCase();
          const isMessageEvent =
            typeRaw.includes("message") ||
            typeRaw.includes("created") ||
            (typeof evt?.messageId === "number" &&
              (typeof evt?.text === "string" || typeof evt?.content === "string"));

          const preview =
            evt?.text ?? evt?.content ?? evt?.lastMessagePreview ?? evt?.preview ?? null;
          const date = evt?.createdDate ?? evt?.sentAt ?? evt?.lastMessageDate ?? evt?.date ?? null;

          const seqCand =
            evt?.seq ?? evt?.version ?? evt?.lastMessageId ?? evt?.messageId ?? evt?.lastEventSeq;
          const seqNum = Number(seqCand);
          if (Number.isFinite(seqNum)) {
            const cur = latestSeqRef.current[rid] ?? -Infinity;
            if (seqNum <= cur) return;
            latestSeqRef.current[rid] = seqNum;
          }

          // 새 메시지 → 내가 보낸 게 아니면 unread + 1
          if (isMessageEvent) {
            const senderId = evt?.senderId ?? evt?.userId ?? evt?.sender?.id;
            const isMine = typeof senderId === "number" && senderId === me;

            qc.setQueryData<RoomResponseDTO[] | undefined>(["chatRooms"], (prev) => {
              if (!prev) return prev;
              let changed = false;
              const next = prev.map((r0) => {
                if (r0.roomId !== rid) return r0;
                const r = { ...r0 };
                if (typeof preview === "string") r.lastMessagePreview = preview;
                if (typeof date === "string") r.lastMessageDate = date;
                if (!isMine) {
                  r.unreadCount = Math.max(0, Number(r.unreadCount ?? 0) + 1);
                }
                if (
                  r.lastMessagePreview !== r0.lastMessagePreview ||
                  r.lastMessageDate !== r0.lastMessageDate ||
                  r.unreadCount !== r0.unreadCount
                ) {
                  changed = true;
                  return r;
                }
                return r0;
              });
              return changed ? next : prev;
            });
            return;
          }

          // 읽음 이벤트(방 토픽으로도 오는 경우) → 내가 읽었으면 0
          if (typeRaw.includes("read") || typeRaw.includes("ack")) {
            const readerId = evt?.readerId ?? evt?.userId ?? evt?.reader?.id;
            if (typeof readerId === "number" && readerId === me) {
              patchRoom(rid, { unreadCount: 0 });
            }
            return;
          }
        });

        subs.set(rid, off);
      }

      // 빠진 방 구독 해제
      const currentIds = new Set(rooms.map((r) => r.roomId));
      for (const [rid, off] of subs) {
        if (!currentIds.has(rid)) {
          try {
            off?.();
          } catch {}
          subs.delete(rid);
        }
      }
    };

    // 1) 지금 상태로 1회 동기화
    syncSubscriptions();

    // 2) QueryCache 구독 → chatRooms 캐시가 바뀔 때마다 재동기화
    const unsub = qc.getQueryCache().subscribe((event) => {
      const q = (event as any).query as Query | undefined;
      if (!q) return;
      // chatRooms 쿼리만 감시
      const isChatRooms =
        Array.isArray(q.queryKey) && q.queryKey.length === 1 && q.queryKey[0] === "chatRooms";
      if (!isChatRooms) return;

      // 데이터가 갱신/성공했을 때만
      if (q.state.status === "success") {
        syncSubscriptions();
      }
    });

    return () => {
      unsub();
      // 전체 해제
      for (const [, off] of roomSubsRef.current) {
        try {
          off?.();
        } catch {}
      }
      roomSubsRef.current.clear();
    };
  }, [me, qc]);
}
