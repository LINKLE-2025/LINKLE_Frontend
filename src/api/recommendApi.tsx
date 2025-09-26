// src/api/recommendApi.tsx
import apiClient from "./apiClient";

// 🔹 AI 추천 링커 조회
export const getRecommendations = async (
    lat: number,
    lng: number,
    userId: number,
    topK: number = 5,
    radiusKm: number = 1
) => {
    const res = await apiClient.get("/linkers/recommend", {
        params: { lat, lng, userId, radiusKm, topK },
    });
    return res.data;
};
