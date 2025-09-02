// src/utils/spot.ts

/** 좌표로부터 고유 스팟 ID 생성 */
export const spotIdFromLatLng = (lat: number, lng: number, precision: number = 3): string => {
  const f = (n: number) => n.toFixed(precision);
  return `${f(lat)}_${f(lng)}`;
};

/** 현재 시각 ISO 문자열 반환 */
export const nowIso = (): string => new Date().toISOString();
