// src/pages/chat/ChatRoom.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Client, IFrame } from "@stomp/stompjs";
import { Send } from "lucide-react";

/** ====== 타입 ====== */
type RoomResponseDTO = {
  roomId: number;
  roomType: "DM" | "LIGHT" | "CLASS";
  roomName?: string | null;

  /** DM 전용 */
  dmPartnerId?: number | null;
  dmPartnerName?: string | null;
  dmPartnerProfileImageUrl?: string | null;

  /** 과거 호환 (있으면 사용) */
  friendNickname?: string | null;
};

type MemberResponse = {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
};

type MessageDTO = {
  messageId: number;
  roomId: number;
  messageType: "TEXT" | "SYSTEM";
  text: string;
  createdDate: string; // ISO
  senderId?: number | null;
  senderName?: string | null;
  senderImage?: string | null;
};

/** ====== 환경변수 & 유틸 ====== */
const API_BASE = import.meta.env.VITE_API_SERVER as string; // ex) https://192.168.0.128:7777
const WS_URL = import.meta.env.VITE_WS_URL as string; // ex) wss://192.168.0.128:7777/ws-stomp
const DEV_UID = String(import.meta.env.VITE_DEV_USER_ID ?? "2");
const MINIO_BASE = (import.meta.env as any).VITE_MINIO_BASE as string | undefined;

function resolveImageUrl(input?: string | null) {
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) return input;
  if (!MINIO_BASE) return null;
  const b = MINIO_BASE.endsWith("/") ? MINIO_BASE.slice(0, -1) : MINIO_BASE;
  const k = input.startsWith("/") ? input.slice(1) : input;
  return `${b}/${k}`;
}

function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoom() {
  const { roomId: rid } = useParams();
  const roomId = Number(rid);

  const [room, setRoom] = useState<RoomResponseDTO | null>(null);
  const [peer, setPeer] = useState<{ name: string; avatar?: string | null } | null>(null);

  const [msgs, setMsgs] = useState<MessageDTO[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting");

  // 고정 입력창 위치 계산
  const [footerBottom, setFooterBottom] = useState(0); // px
  const [inputHeight, setInputHeight] = useState(64); // px (본문 paddingBottom 계산용)
  const inputRef = useRef<HTMLDivElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef(
    new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 2000,
      debug: () => {},
    }),
  );

  /** Footer/입력창 높이 측정 */
  useEffect(() => {
    const measure = () => {
      const footer = document.querySelector("footer");
      setFooterBottom(footer ? footer.clientHeight : 0);
      if (inputRef.current) setInputHeight(inputRef.current.clientHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 300); // 모바일 주소창/키보드 변화 보정
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, []);

  /** 초기 데이터 + 소켓 구독 */
  useEffect(() => {
    if (!roomId) return;

    const fetchJSON = (url: string) =>
      fetch(url, {
        headers: { "x-user-id": DEV_UID, Accept: "application/json" },
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      });

    (async () => {
      // 방 상세 + 최근 메시지
      const [r, m] = await Promise.all([
        fetchJSON(`${API_BASE}/chat/room/${roomId}`) as Promise<RoomResponseDTO>,
        fetchJSON(`${API_BASE}/chat/room/${roomId}/messages?size=30`) as Promise<any[]>,
      ]);

      setRoom(r);

      // 상대 표시: DM은 파트너, 그룹/클래스는 멤버 중 본인 제외 대표 1명
      if (r.roomType === "DM") {
        setPeer({
          name: r.dmPartnerName ?? r.friendNickname ?? "(상대)",
          avatar: resolveImageUrl(r.dmPartnerProfileImageUrl) ?? null,
        });
      } else {
        try {
          const members = (await fetchJSON(
            `${API_BASE}/chat/room/${roomId}/members`,
          )) as MemberResponse[];
          const others = members.filter((u) => String(u.userId) !== DEV_UID);
          if (others.length > 0) {
            setPeer({
              name: others[0].nickname,
              avatar: resolveImageUrl(others[0].profileImageUrl) ?? null,
            });
          } else {
            setPeer({ name: r.roomName ?? "그룹 채팅", avatar: null });
          }
        } catch {
          setPeer({ name: r.roomName ?? "그룹 채팅", avatar: null });
        }
      }

      // 메시지 정규화
      const normalized = (m ?? []).map((x) => ({
        ...x,
        text: x.text ?? x.content ?? "",
      })) as MessageDTO[];
      setMsgs(normalized.reverse());
    })().catch((e) => console.error("[INIT] error", e));

    // STOMP
    const client = clientRef.current;
    client.onConnect = (_frame: IFrame) => {
      setStatus("open");
      client.subscribe(`/sub/room.${roomId}`, (frame) => {
        const raw = JSON.parse(frame.body);
        const evt: MessageDTO = {
          messageId: raw.messageId ?? Date.now(),
          roomId: raw.roomId ?? roomId,
          messageType: raw.messageType ?? "TEXT",
          text: raw.text ?? raw.content ?? "",
          createdDate: raw.createdDate ?? new Date().toISOString(),
          senderId: raw.senderId ?? raw.userId ?? raw.sender?.userId ?? null,
          senderName: raw.senderName ?? raw.sender?.nickname ?? null,
          senderImage: resolveImageUrl(raw.senderImage ?? raw.sender?.image) ?? null,
        };
        setMsgs((prev) => [...prev, evt]);
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

  /** 새 메시지 → 하단 스크롤 */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  /** 전송 */
  const send = () => {
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
    setText("");
  };

  if (!room) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <>
      {/* ===== 메시지 영역 (입력창 높이만큼 padding-bottom) ===== */}
      <main
        style={{
          width: "100%",
          maxWidth: 768,
          margin: "0 auto",
          padding: "8px 16px",
          paddingBottom: `calc(${inputHeight}px + 24px + env(safe-area-inset-bottom, 0px))`,
          background: "#fafafa",
          boxSizing: "border-box",
          minHeight: "100%",
        }}
      >
        {msgs.map((m, i) => {
          const isMine = m.senderId === Number(DEV_UID);
          const prev = msgs[i - 1];
          const newSenderBlock = !isMine && (!prev || prev.senderId !== m.senderId);

          return (
            <div key={m.messageId} style={{ margin: "10px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                {/* 👇 상대 메시지일 때만 왼쪽에 아바타(연속이면 첫 메시지만) */}
                {!isMine &&
                  (newSenderBlock ? (
                    (m.senderImage ?? peer?.avatar) ? (
                      <img
                        src={m.senderImage ?? peer?.avatar ?? ""}
                        alt={m.senderName ?? peer?.name ?? ""}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "9999px",
                          objectFit: "cover",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "9999px",
                          background: "#e5e7eb",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                    )
                  ) : (
                    // 연속 메시지는 아바타 대신 같은 폭의 스페이서로 정렬 유지
                    <div style={{ width: 36, height: 1, flexShrink: 0 }} />
                  ))}

                {/* 본문(이름 + 말풍선 + 시간) */}
                <div style={{ maxWidth: "72%" }}>
                  {/* 이름: 상대 블록의 첫 메시지에만 상단에 작게 */}
                  {!isMine && newSenderBlock && (
                    <div style={{ fontSize: 12, color: "#666", margin: "0 0 4px 4px" }}>
                      {m.senderName ?? peer?.name ?? "상대"}
                    </div>
                  )}

                  {/* 말풍선 + 시간(말풍선 오른쪽) */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "10px 12px",
                        borderRadius: 16,
                        background: isMine ? "#e9ffe4" : "#fff",
                        boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.text}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#888",
                        marginBottom: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(m.createdDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* ===== 고정 입력창 (푸터 위) ===== */}
      <div
        ref={inputRef}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: `calc(${footerBottom}px + env(safe-area-inset-bottom, 0px))`,
          borderTop: "1px solid #eee",
          background: "#fff",
          boxShadow: "0 -2px 8px rgba(0,0,0,.04)",
          zIndex: 20,
        }}
      >
        <div className='w-full max-w-md mx-auto px-4 py-2'>
          <div className='flex items-center gap-2'>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder='채팅을 입력하세요'
              className='flex-1 rounded-2xl bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300'
            />
            <button
              onClick={send}
              className='p-2 rounded-full hover:bg-gray-100 transition'
              aria-label='send'
              type='button'
            >
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                <path d='M22 2L11 13' stroke='#6b7280' strokeWidth='2' strokeLinecap='round' />
                <path
                  d='M22 2L15 22L11 13L2 9L22 2Z'
                  stroke='#6b7280'
                  strokeWidth='2'
                  fill='none'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
