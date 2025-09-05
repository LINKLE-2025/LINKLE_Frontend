// src/pages/chat/ChatRoom.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Client, IFrame } from "@stomp/stompjs";

type RoomResponseDTO = {
  roomId: number;
  roomType: "DM" | "LIGHT" | "CLASS";
  roomName?: string | null;
  friendNickname?: string | null;
};

type MessageDTO = {
  messageId: number;
  roomId: number;
  messageType: "TEXT" | "SYSTEM";
  text: string; //
  createdDate: string; // ISO
  senderId?: number | null;
  senderName?: string | null;
  senderImage?: string | null;
};

const API_BASE = import.meta.env.VITE_API_SERVER as string; // ex) https://192.168.0.128:7777
const WS_URL = import.meta.env.VITE_WS_URL as string; // ex) wss://192.168.0.128:7777/ws-stomp
const DEV_UID = String(import.meta.env.VITE_DEV_USER_ID ?? "2");

export default function ChatRoom() {
  const { roomId: rid } = useParams();
  const roomId = Number(rid);

  const [room, setRoom] = useState<RoomResponseDTO | null>(null);
  const [msgs, setMsgs] = useState<MessageDTO[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting");

  const bottomRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef(
    new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 2000,
      debug: () => {}, // 필요 시 (s) => console.log("[STOMP]", s)
    }),
  );

  // 초기 데이터 + 소켓 구독
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
      const [r, m] = await Promise.all([
        fetchJSON(`${API_BASE}/chat/room/${roomId}`) as Promise<RoomResponseDTO>,
        fetchJSON(`${API_BASE}/chat/room/${roomId}/messages?size=30`) as Promise<any[]>,
      ]);
      setRoom(r);

      // 서버가 과거에 content로 내려오던 케이스 대비: text로 보정
      const normalized = (m ?? []).map((x) => ({
        ...x,
        text: x.text ?? x.content ?? "",
      })) as MessageDTO[];
      setMsgs(normalized.reverse()); // 오래된 메시지부터 보이도록 역순
    })().catch((e) => console.error("[INIT] error", e));

    const client = clientRef.current;

    client.onConnect = (_frame: IFrame) => {
      setStatus("open");
      client.subscribe(`/sub/room.${roomId}`, (frame) => {
        const raw = JSON.parse(frame.body);
        const evt: MessageDTO = {
          messageId: raw.messageId ?? Date.now(),
          roomId: raw.roomId ?? roomId,
          messageType: raw.messageType ?? "TEXT",
          text: raw.text ?? raw.content ?? "", // 안전 보정
          createdDate: raw.createdDate ?? new Date().toISOString(),
          senderId: raw.senderId ?? raw.userId ?? raw.sender?.userId ?? null,
          senderName: raw.senderName ?? raw.sender?.nickname ?? null,
          senderImage: raw.senderImage ?? raw.sender?.image ?? null,
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

  // 새 메시지 오면 스크롤 하단으로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // 메시지 전송 (text만 사용)
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
      headers: { "x-user-id": DEV_UID }, // 서버에서 이 헤더로 보낸 사람 식별
      body: JSON.stringify({ roomId, text: body }), // ✅ text로 전송
    });
    setText("");
  };

  if (!room) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <b>{room.roomType === "DM" ? room.friendNickname : room.roomName}</b>
        <small style={{ color: status === "open" ? "#2a7" : status === "error" ? "#d33" : "#888" }}>
          {status}
        </small>
      </header>

      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px", background: "#fafafa" }}>
        {msgs.map((m) => (
          <div
            key={m.messageId}
            style={{
              margin: "4px 0",
              display: "flex",
              justifyContent: m.senderId === Number(DEV_UID) ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "8px 12px",
                borderRadius: 12,
                background: m.senderId === Number(DEV_UID) ? "#e9ffe4ff" : "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,.05)",
              }}
            >
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{m.text}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                {new Date(m.createdDate).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <footer style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #eee" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder='메시지를 입력하세요'
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 12 }}
        />
        <button
          onClick={send}
          disabled={status !== "open"}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(111, 226, 184, 1)",
            color: "#fff",
            border: "none",
          }}
        >
          보내기
        </button>
      </footer>
    </div>
  );
}
