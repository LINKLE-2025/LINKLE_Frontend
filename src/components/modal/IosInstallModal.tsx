import { useEffect } from "react";
import { Share } from 'lucide-react';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function IosInstallModal({ open, onClose }: Props) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"; // 모달 열렸을 때 스크롤 방지
        } else {
            document.body.style.overflow = "auto";
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-lg max-w-sm w-11/12 p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-3">iOS 앱 설치 안내</h2>
                <p className="text-xs xxs:text-sm text-gray-700 mb-4">
                    브라우저(Chrome, Safari)에서 아래를 따라 <br />
                    홈 화면에 LINKLE 앱을 추가해주세요.
                </p>

                <ol className=" w-max list-decimal list-inside text-left text-xs xxs:text-sm text-gray-700 space-y-2 mb-4 mx-auto">
                    <li>주소창의 <strong>공유 버튼</strong>(<Share size={15} className="inline" /> 아이콘)을 누릅니다.</li>
                    <li>하단에서 <strong>홈 화면에 추가</strong>를 선택합니다.</li>
                    <li>이름을 확인한 뒤 <strong>추가</strong> 버튼을 누릅니다.</li>
                </ol>

                <button
                    className="w-full bg-linkleGray hover:bg-black text-white font-bold py-2.5 rounded-full"
                    onClick={onClose}
                >
                    확인
                </button>

                <button
                    className="absolute top-3 right-4 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}