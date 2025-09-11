// src/lib/stompClient.ts
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

type Handler = (data: any, frame: IMessage) => void;
type Status = "connecting" | "open" | "closed" | "error";

let client: Client | null = null;
let status: Status = "closed";

// 토픽별 구독자(콜백) 목록
const topicHandlers = new Map<string, Set<Handler>>();
// 실제 STOMP 구독 객체 저장(토픽 -> subscription)
const activeSubs = new Map<string, StompSubscription>();

// 상태 변화 리스너 (옵션)
const statusListeners = new Set<(s: Status) => void>();
const notifyStatus = (s: Status) => {
  status = s;
  statusListeners.forEach((fn) => fn(s));
};

function realSubscribe(topic: string) {
  if (!client || !client.connected) return;
  if (activeSubs.has(topic)) return;
  const sub = client.subscribe(topic, (frame) => {
    const data = frame.body ? safeParse(frame.body) : null;
    const handlers = topicHandlers.get(topic);
    if (!handlers) return;
    handlers.forEach((h) => h(data, frame));
  });
  activeSubs.set(topic, sub);
}

function safeParse(body: string) {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export const stompClient = {
  /**
   * 앱 시작 시 1회만 호출
   */
  init: (url: string, connectHeaders?: Record<string, string>) => {
    if (client) return; // 중복 초기화 방지

    client = new Client({
      brokerURL: url, // 또는 webSocketFactory 사용 가능
      connectHeaders,
      reconnectDelay: 2000, // 자동 재연결
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        notifyStatus("open");
        // 재연결 시 기존 토픽 자동 재구독
        Array.from(topicHandlers.keys()).forEach((topic) => realSubscribe(topic));
      },
      onStompError: () => notifyStatus("error"),
      onWebSocketError: () => notifyStatus("error"), // 🔧 권장: 소켓 에러도 status 반영
      onWebSocketClose: () => {
        // 연결 끊김 → STOMP가 자동 재연결 시도
        notifyStatus("closed");
        // 실제 sub 객체는 무효이므로 비우되, topicHandlers는 유지하여 onConnect 때 재구독
        activeSubs.clear();
      },
      // ⚠️ @stomp/stompjs에 타입 정의 없는 경우가 있어 에러가 날 수 있음 → 제거
      // onChangeState: () => {
      //   if (!client) return;
      //   notifyStatus(client.connected ? "open" : "connecting");
      // },
    });

    notifyStatus("connecting");
    client.activate();
  },

  /**
   * 토큰/헤더 갱신 필요 시 재연결
   */
  reconnectWith: async (connectHeaders?: Record<string, string>) => {
    if (!client) return;
    const url = client.brokerURL; // 🔧 안전: 새 Client 만들기 전에 url 보관
    await client.deactivate();
    activeSubs.clear();

    client = new Client({
      brokerURL: url!,
      connectHeaders,
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        notifyStatus("open");
        Array.from(topicHandlers.keys()).forEach((topic) => realSubscribe(topic));
      },
      onStompError: () => notifyStatus("error"),
      onWebSocketError: () => notifyStatus("error"),
      onWebSocketClose: () => {
        notifyStatus("closed");
        activeSubs.clear();
      },
    });

    notifyStatus("connecting");
    client.activate();
  },

  /**
   * 화면/훅에서 호출: 토픽 구독
   * 반환하는 함수(off)를 언마운트 시 호출해 제거 (반드시 () => void)
   */
  subscribe: (topic: string, handler: Handler): (() => void) => {
    let set = topicHandlers.get(topic);
    if (!set) {
      set = new Set();
      topicHandlers.set(topic, set);
    }
    set.add(handler);

    // 연결돼 있으면 즉시 실제 구독
    if (client?.connected) realSubscribe(topic);

    // off 함수 (반환값 없음)
    return () => {
      const s = topicHandlers.get(topic);
      if (!s) return;
      s.delete(handler); // boolean 반환값 버림
      if (s.size === 0) {
        topicHandlers.delete(topic);
        // 실제 STOMP 구독도 해제
        const sub = activeSubs.get(topic);
        sub?.unsubscribe();
        activeSubs.delete(topic);
      }
    };
  },

  publish: (destination: string, body: any, headers?: Record<string, string>) => {
    if (!client || !client.connected) return;
    client.publish({
      destination,
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  },

  onStatusChange: (fn: (s: Status) => void): (() => void) => {
    statusListeners.add(fn);
    fn(status);
    // 🔧 중요: cleanup은 항상 void여야 함. boolean을 리턴하지 마세요.
    return () => {
      statusListeners.delete(fn); // 반환값 버림 → () => void
    };
  },

  getStatus: () => status,
  isConnected: () => !!client?.connected,
};
