// 브라우저 localStorage 기반 저장/로드 (TypeScript 버전)
export function load(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }
    catch (e) {
        console.error("localStorage load error:", e);
        return defaultValue;
    }
}
export function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
        console.error("localStorage save error:", e);
    }
}
