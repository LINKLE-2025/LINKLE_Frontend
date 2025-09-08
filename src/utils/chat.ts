const MINIO_BASE = (import.meta.env as any).VITE_MINIO_BASE as string | undefined;

export function resolveImageUrl(input?: string | null) {
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) return input;
  if (!MINIO_BASE) return null;
  const b = MINIO_BASE.endsWith("/") ? MINIO_BASE.slice(0, -1) : MINIO_BASE;
  const k = input.startsWith("/") ? input.slice(1) : input;
  return `${b}/${k}`;
}

export function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const API_BASE = import.meta.env.VITE_API_SERVER as string;

export function userProfileUrl(userId?: number | null) {
  return typeof userId === "number" && userId > 0
    ? `${API_BASE}/api/user/view/profile/${userId}`
    : "";
}

// (참고) 이미 적용한 방 배경
export function roomBackgroundUrl(roomId?: number | null) {
  return typeof roomId === "number" && roomId > 0
    ? `${API_BASE}/chat/view/background/${roomId}`
    : "";
}
