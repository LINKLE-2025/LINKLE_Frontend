// 링커 서비스
export interface LinkerPayload {
  name: string;
  memo?: string;
  address?: string;
  locationX?: number;
  locationY?: number;
  categoryId: number;
  addressDetail: string;
  addressName?: string;
}

export interface LinkerListItem {
  address?: string;
  addressName?: string; // 백엔드 오타 호환
  linkerId: number;
  name: string;
  categoryId?: number | null;
  locationX: number | null; // 경도 (lng)
  locationY: number | null; // 위도 (lat)
  // 백워드 호환
  lat?: number | null;
  lng?: number | null;
  state?: "ACTIVATED" | "DELETED";
}

export interface LinkerDetail {
  linkerId: number;
  name: string;
  address?: string;
  addressName?: string; // 백엔드 오타 호환
  categoryId?: number | null;
  locationX?: number | null;
  locationY?: number | null;
  memo?: string | null;
  createdAt?: string;
  phone?: string | null;
}

// 링커 저장
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

// 링커 목록 조회
export async function fetchLinkers(): Promise<LinkerListItem[]> {
  const res = await fetch("/api/linker", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("GET /api/linker 실패");
  return res.json();
}

// 링커 상세 조회
export async function fetchLinkerDetail(linkerId: number): Promise<LinkerDetail> {
  const res = await fetch(`/api/linker/${linkerId}`, { credentials: "include" });

  if (!res.ok) {
    let serverMsg = "";
    try {
      const errJson = await res.json();
      serverMsg = errJson?.message || "";
    } catch {
      /* ignore */
    }

    if (res.status === 404) {
      throw new Error(serverMsg || "해당 링커를 찾을 수 없어요. (404)");
    }
    throw new Error(serverMsg || `상세 조회 실패 (${res.status})`);
  }

  return res.json();
}
