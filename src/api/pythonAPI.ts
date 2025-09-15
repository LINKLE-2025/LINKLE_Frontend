import apiClient from "./apiClient";

// 추천 결과 가져오기
export const getRecommend = async (userId: number) => {
    const res = await apiClient.get("/recommend", {
      params: { userId },
    });
    return res.data;
  };
