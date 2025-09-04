import { Client, StompSubscription } from "@stomp/stompjs";

export function createRoomSocket(wsUrl: string, userId: number) {
  const client = new Client({
    webSocketFactory: () => new WebSocket(wsUrl), // ex) wss://192.168.0.128:7777/ws-stomp
    reconnectDelay: 2000,
    debug: () => {},
  });

  return {
    client,
    subscribe(roomId: number, onEvent: (evt: any) => void): StompSubscription {
      return client.subscribe(`/sub/room.${roomId}`, (frame) => {
        onEvent(JSON.parse(frame.body));
      });
    },
    send(roomId: number, content: string) {
      client.publish({
        destination: "/app/message.send",
        headers: { "x-user-id": String(userId) }, // 서버 규약
        body: JSON.stringify({ roomId, content }),
      });
    },
  };
}
