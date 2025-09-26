import { useState } from "react";
import ActionCircleButton from "../common/ActionCircleButton";

// 추천 버튼 컴포넌트
// 클릭 시 추천 API 호출 후 결과 표시


export default function RecommendButton() {
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const fetchRecommendations = async () => {
        try {
            const res = await fetch(
                "http://192.168.0.129:7777/api/linkers/recommend?lat=37.5611&lng=126.9195&interests=연남,카페,1&radiusKm=3&topK=5",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error("추천 API 호출 실패");

            const data = await res.json();
            console.log("추천 결과:", data);
            setRecommendations(data);
        } catch (err) {
            console.error("추천 요청 에러:", err);
        }
    };

    return (
        <div className="p-4">
            <ActionCircleButton
                className="text-linkleGray"
                icon={<img src="/icons/mapicon/findLocation.svg" className="w-6 h-6" />}
                onClick={fetchRecommendations}
            />

            {/* 추천 리스트 */}
            <div className="mt-6">
                {recommendations.length > 0 ? (
                    recommendations.map((item) => (
                        <div
                            key={item.linkerId}
                            className="p-3 mb-2 border rounded-lg shadow-sm bg-white"
                        >
                            <p className="font-bold text-lg">
                                {item.name}{" "}
                                {item.score && (
                                    <span className="text-sm text-gray-500">
                                        (유사도: {item.score.toFixed(3)})
                                    </span>
                                )}
                            </p>
                            <p className="text-gray-700">{item.memo || "메모 없음"}</p>
                            <p className="text-gray-500">{item.address}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">추천 결과 없음</p>
                )}
            </div>
        </div>
    );
}
