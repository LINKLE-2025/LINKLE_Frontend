import apiClient from "./apiClient";

// 추천 결과 가져오기
export const getRecommend = async (userId: number, addressDetail?: string) => {
  const res = await apiClient.get("/recommend", {
    params: { userId, address_detail: addressDetail },  // userId 로 보냄
  });
  return res.data;
};