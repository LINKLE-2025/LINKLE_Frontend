// src/utils/spot.ts
/** 좌표로부터 고유 스팟 ID 생성 */
export const spotIdFromLatLng = (lat, lng, precision = 3) => {
    const f = (n) => n.toFixed(precision);
    return `${f(lat)}_${f(lng)}`;
};
/** 현재 시각 ISO 문자열 반환 */
export const nowIso = () => new Date().toISOString();
