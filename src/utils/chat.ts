// 환경변수
const MINIO_BASE = (import.meta.env as any).VITE_MINIO_BASE as string | undefined;
export const API_BASE = import.meta.env.VITE_API_SERVER as string;

// 이미지 URL 생성기 (S3/MinIO)
export function resolveImageUrl(input?: string | null): string | null {
  if (!input) return null;

  // 절대 URL이면 그대로 반환
  if (/^https?:\/\//i.test(input)) return input;

  // 환경변수 없으면 null
  if (!MINIO_BASE) return null;

  const base = MINIO_BASE.endsWith("/") ? MINIO_BASE.slice(0, -1) : MINIO_BASE;
  const key = input.startsWith("/") ? input.slice(1) : input;

  return `${base}/${key}`;
}

// 시간 라벨 포맷터
export function formatTimeLabel(ts?: string | number | null): string {
  if (!ts) return "";

  let d: Date;
  if (typeof ts === "number") {
    d = new Date(ts < 1e12 ? ts * 1000 : ts); // 초 단위 → 밀리초 변환
  } else if (/^\d+$/.test(ts)) {
    const n = Number(ts);
    d = new Date(n < 1e12 ? n * 1000 : n);
  } else {
    d = new Date(ts); // ISO 문자열
  }
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const sameYear = d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });

  if (sameDay) {
    // 오늘: 오전 11:12
    return time;
  }

  if (sameYear) {
    // 같은 해: "9월 5일"
    return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  }

  // 다른 해: "2024년 9월"
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
}

// 프로필 이미지 URL
export function userProfileUrl(userId?: number | null): string {
  return typeof userId === "number" && userId > 0
    ? `${API_BASE}/api/user/view/profile/${userId}`
    : "";
}

// 방 배경 이미지 URL
export function roomBackgroundUrl(roomId?: number | null): string {
  return typeof roomId === "number" && roomId > 0
    ? `${API_BASE}/api/chat/view/background/${roomId}`
    : "";
}
