import RandomPastelBackground from "../background/RandomPastelBackground";

// src/components/common/FullScreenLoader.tsx
export default function FullScreenLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50">
            <div className="flex flex-col items-center animate-fadeIn">
                <RandomPastelBackground />

                {/* 로고 아이콘 */}
                <img
                    src="/logos/linkle-icon.svg"
                    alt="LINKLE 심볼"
                    className="w-2/3 sm:w-1/3 mb-6"
                />

                {/* 브랜드 텍스트 로고 */}
                <img
                    src="/logos/logo_text.svg"
                    alt="LINKLE 로고 텍스트"
                    className="w-[55vw] sm:w-[25vw] h-auto mb-4"
                />

                {/* 로딩 메시지 */}
                {/* <p className="text-gray-600 text-lg sm:text-2xl tracking-wide animate-pulse">
                    잠시만 기다려주세요...
                </p> */}
            </div>
        </div>
    );
}
