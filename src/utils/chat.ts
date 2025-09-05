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
