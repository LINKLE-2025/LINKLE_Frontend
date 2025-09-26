// src/components/recommend/RecommendedLinkerModal.tsx
import React from "react";
import { Sheet } from "react-modal-sheet";

type RecommendedLinker = {
    linkerId: number;
    name: string;
    memo?: string;
    address: string;
    score?: number;
};

interface RecommendedLinkerModalProps {
    open: boolean;
    onClose: () => void;
    recommendations: RecommendedLinker[];
}

export default function RecommendedLinkerModal({
    open,
    onClose,
    recommendations,
}: RecommendedLinkerModalProps) {
    return (
        <Sheet
            isOpen={open}
            onClose={onClose}
            snapPoints={[0.65, 0.4, 0.3]}
            initialSnap={0}
        >
            <Sheet.Container>
                <Sheet.Header>
                    <div className="mx-auto my-1 h-1 w-24 rounded-full bg-gray-300" />
                </Sheet.Header>
                <Sheet.Content>
                    <div className="flex flex-col h-full p-4 overflow-y-auto">
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
                </Sheet.Content>
            </Sheet.Container>
        </Sheet>
    );
}
