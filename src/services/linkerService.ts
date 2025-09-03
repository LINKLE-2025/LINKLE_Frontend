// 링커 관련 서비스 함수들
export interface LinkerPayload {
  name: string;
  memo?: string;
  address?: string;
  locationX?: number;
  locationY?: number;
  categoryId: number;
  addressDetail: string;
  addressName?: string; // 상호명은 optional
}

// 서버 저장
export async function saveLinker(payload: LinkerPayload) {
  const safePayload = {
    ...payload,
    memo: payload.memo ?? "",
    address: payload.address ?? "",
    addressName: payload.addressName ?? "",
  };

  const res = await fetch("/api/linker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(safePayload),
    credentials: "include",
  });

  if (!res.ok) throw new Error("POST /api/linker 실패");
  return res;
}

// 기존 링커 불러오기
export async function fetchLinkers() {
  const res = await fetch("/api/linker");
  if (!res.ok) throw new Error("GET /api/linker 실패");
  return res.json() as Promise<
    Array<{
      name: string;
      locationX?: number;
      locationY?: number;
      lat?: number;
      lng?: number;
      categoryId?: number;
    }>
  >;
}
