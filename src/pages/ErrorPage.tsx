import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ErrorType = "network" | "server" | "auth" | "unknown";

const errorMessages: Record<
    ErrorType,
    { title: string; description: string; }
> = {
    network: {
        title: "네트워크 연결 끊김",
        description: "인터넷 연결이 원활하지 않습니다.\n잠시 후 다시 시도해주세요.",
    },
    server: {
        title: "서버 오류 발생",
        description: "서버에 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.",
    },
    auth: {
        title: "인증 오류",
        description: "로그인 세션이 만료되었습니다.\n다시 로그인해주세요.",
    },
    unknown: {
        title: "존재하지 않는 페이지",
        description: "요청하신 페이지를 찾을 수 없습니다.\n주소를 다시 확인해주세요.",
    },
};

export default function ErrorPage() {
    const { type } = useParams<{ type: ErrorType }>();

    // URL 파라미터에 따른 에러 메시지 설정 (기본값: unknown)
    const errorType: ErrorType = (type as ErrorType) ?? "unknown";

    // 에러 메시지
    const { title, description } = errorMessages[errorType];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center animate-fadeIn">
            {/* 로고 아이콘 */}
            <img
                src="/logos/linkle-icon.svg"
                alt="LINKLE 심볼"
                className="w-1/2 sm:w-1/5 mb-6"
            />

            {/* 브랜드 텍스트 로고 */}
            <img
                src="/logos/logo_text.svg"
                alt="LINKLE 로고 텍스트"
                className="w-[50vw] sm:w-[20vw] h-auto mb-4 xxs:mb-6"
            />

            {/* 에러 메시지 */}
            <div className="animate-pulse">
                <h1 className="text-xl xxs:text-2xl font-bold my-3">{title}</h1>
                <p className="max-w-xs text-sm xxs:text-base text-linkleGray whitespace-pre-line my-2">{description}</p>
            </div>

            {/* 홈으로 돌아가기 링크 */}
            <a href='/' className='text-sm xxs:text-base font-medium text-black/40 hover:text-black/60 transition-colors mt-4'>
                홈으로 돌아가기
            </a>
        </div>
    );
}
