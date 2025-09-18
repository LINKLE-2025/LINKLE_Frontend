import RandomPastelBackground from "../background/RandomPastelBackground";

type Props = {
    isWaiting?: boolean;
};

export default function FullScreenLoader({ isWaiting = false }: Props) {
    return (
        <div className="select-none fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50">
            <div className={`flex flex-col items-center ${isWaiting ? "" : "animate-fadeIn"}`}>
                <RandomPastelBackground />

                {/* 로고 아이콘 */}
                <img
                    src="/logos/linkle-icon.svg"
                    alt="LINKLE 심볼"
                    className="w-7/12 sm:w-4/12 mb-6 sm:mb-7"
                />

                {/* 브랜드 텍스트 로고 */}
                <img
                    src="/logos/logo_text.svg"
                    alt="LINKLE 로고 텍스트"
                    className="w-[55vw] sm:w-[20vw] h-auto mb-4"
                />


                {/* 로딩 메시지 */}
                {isWaiting && (
                    <p className="text-gray-600 text-lg sm:text-2xl tracking-wide animate-pulse">
                        잠시만 기다려주세요...
                    </p>
                )}
            </div>
        </div>
    );
}
