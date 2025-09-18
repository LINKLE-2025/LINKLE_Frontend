// src/utils/notifyPrefs.ts
import { useSyncExternalStore } from "react";

const KEY = "chat:mutedRoomIds";
type Listener = () => void;
const listeners = new Set<Listener>();

function readSet(): Set<number> {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as any[]) : [];
    return new Set(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

// 🔒 모듈 전역 상태 (참조 안정성 유지)
let cache = readSet();
let cacheArray: ReadonlyArray<number> = Object.freeze(Array.from(cache));

function emit() {
  listeners.forEach((fn) => fn());
}

function write(next: Set<number>) {
  // 동일 내용이면 스킵(옵션)
  if (next.size === cache.size && [...next].every((n) => cache.has(n))) return;

  cache = new Set(next);
  cacheArray = Object.freeze(Array.from(cache)); // ❗ getSnapshot이 반환하는 “항상 같은 참조”
  localStorage.setItem(KEY, JSON.stringify(cacheArray));
  emit();
}

// 다른 탭/창과 동기화
window.addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  cache = readSet();
  cacheArray = Object.freeze(Array.from(cache));
  emit();
});

export function isRoomMuted(roomId?: number) {
  if (roomId == null) return false;
  return cache.has(Number(roomId));
}

export function setRoomMuted(roomId: number, muted: boolean) {
  const n = Number(roomId);
  const next = new Set(cache);
  if (muted) next.add(n);
  else next.delete(n);
  write(next);
}

export function toggleRoomMuted(roomId: number) {
  setRoomMuted(roomId, !isRoomMuted(roomId));
}

// ✅ primitive(Boolean) 스냅샷 → 참조 문제 없음
export function useRoomMute(roomId?: number) {
  const subscribe = (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  const getSnapshot = () => (roomId != null ? isRoomMuted(roomId) : false);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ✅ 배열 스냅샷은 “캐시된 같은 참조”를 반환해야 함
export function useMutedRoomIds(): ReadonlyArray<number> {
  const subscribe = (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  const getSnapshot = () => cacheArray;
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
