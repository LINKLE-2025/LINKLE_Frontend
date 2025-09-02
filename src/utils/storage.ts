// 브라우저 localStorage 기반 저장/로드 (TypeScript 버전)

export function load<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : defaultValue;
  } catch (e) {
    console.error("localStorage load error:", e);
    return defaultValue;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage save error:", e);
  }
}
