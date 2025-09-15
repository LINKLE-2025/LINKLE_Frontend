// src/lib/stompClient.ts
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
type Handler = (data: any, frame: IMessage) => void;
type Status = "connecting" | "open" | "closed" | "error";
let client: Client | null = null;
let status: Status = "closed";

const topicHandlers = new Map<string, Set<Handler>>();
const activeSubs = new Map<string, StompSubscription>();
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

/**  ws(s) 절대URL로 변환 */
function resolveWsUrl(pathOrUrl: string) {
  if (!pathOrUrl) throw new Error("VITE_WS_URL is missing");
  if (pathOrUrl.startsWith("ws://") || pathOrUrl.startsWith("wss://")) return pathOrUrl;
  const wsOrigin = window.location.origin.replace(/^http/, "ws"); // http→ws, https→wss
  return `${wsOrigin}${pathOrUrl}`;
}

/** 내부적으로 항상 절대 WS URL을 보관 */
let currentWsUrl: string | null = null;

export const stompClient = {
  /** 앱 시작 시 1회만 호출 */
  init: (url: string, connectHeaders?: Record<string, string>) => {
    if (client) return;
    currentWsUrl = resolveWsUrl(url);

    client = new Client({
      brokerURL: currentWsUrl,
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

  /** 토큰/헤더 갱신 필요 시 재연결 */
  reconnectWith: async (connectHeaders?: Record<string, string>) => {
    if (!client) return;
    await client.deactivate();
    activeSubs.clear();

    // currentWsUrl은 init 때 절대 URL로 이미 해석됨
    client = new Client({
      brokerURL: currentWsUrl!,
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

  subscribe: (topic: string, handler: Handler): (() => void) => {
    let set = topicHandlers.get(topic);
    if (!set) {
      set = new Set();
      topicHandlers.set(topic, set);
    }
    set.add(handler);
    if (client?.connected) realSubscribe(topic);
    return () => {
      const s = topicHandlers.get(topic);
      if (!s) return;
      s.delete(handler);
      if (s.size === 0) {
        topicHandlers.delete(topic);
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
    return () => {
      statusListeners.delete(fn);
    };
  },
  getStatus: () => status,
  isConnected: () => !!client?.connected,
};
