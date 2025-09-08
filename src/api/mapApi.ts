// src/services/linkerService.ts
import apiClient from "./apiClient";

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

// 🔹 링커 저장
export const saveLinker = async (payload: LinkerPayload) => {
  const safePayload = {
    ...payload,
    memo: payload.memo ?? "",
    address: payload.address ?? "",
    addressName: payload.addressName ?? "",
  };

  try {
    const res = await apiClient.post("/linker", safePayload);
    return res.data;
  } catch (err: any) {
    const msg =
      err.response?.data?.message ||
      `POST /linker 실패: ${err.response?.status} ${err.response?.statusText}`;
    throw new Error(msg);
  }
};

// 🔹 링커 목록 조회
export const fetchLinkers = async (): Promise<LinkerListItem[]> => {
  try {
    const res = await apiClient.get("/linker");
    return res.data;
  } catch (err: any) {
    const msg =
      err.response?.data?.message ||
      `GET /linker 실패: ${err.response?.status} ${err.response?.statusText}`;
    throw new Error(msg);
  }
};

// 🔹 링커 상세 조회
export const fetchLinkerDetail = async (linkerId: number): Promise<LinkerDetail> => {
  try {
    const res = await apiClient.get(`/linker/${linkerId}`);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      throw new Error(err.response?.data?.message || "해당 링커를 찾을 수 없어요. (404)");
    }
    const msg = err.response?.data?.message || `상세 조회 실패 (${err.response?.status})`;
    throw new Error(msg);
  }
};
