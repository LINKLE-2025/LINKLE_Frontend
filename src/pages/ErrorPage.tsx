import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ErrorType } from "@/types/error";

const errorMessages: Record<
    ErrorType,
    { title: string; description: string; autoRetry?: boolean; redirectToLogin?: boolean }
> = {
    network: {
        title: "네트워크 연결 끊김",
        description: "인터넷 연결이 원활하지 않습니다.\n자동으로 재연결을 시도합니다...",
        autoRetry: true,
    },
    server: {
        title: "서버 오류 발생",
        description: "서버에 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.",
    },
    auth: {
        title: "인증 오류",
        description: "로그인 세션이 만료되었습니다.\n다시 로그인해주세요.",
        redirectToLogin: true,
    },
};

export default function ErrorPage() {
    const { type } = useParams<{ type: ErrorType }>();
    const navigate = useNavigate();

    // 잘못된 type일 경우 기본값 = server
    const errorType: ErrorType = (type as ErrorType) ?? "server";

    const { title, description, autoRetry, redirectToLogin } = errorMessages[errorType];

    useEffect(() => {
        // 네트워크 오류 → 일정 주기 재시도
        if (errorType === "network" && autoRetry) {
            const retryInterval = setInterval(async () => {
                try {
                    const res = await fetch("/api/health"); // 헬스체크 API
                    if (res.ok) {
                        clearInterval(retryInterval);
                        navigate("/", { replace: true }); // 복구 시 홈으로 이동
                    }
                } catch {
                    // 여전히 실패 → 계속 대기
                }
            }, 5000);

            return () => clearInterval(retryInterval);
        }

        // 인증 오류 → 자동으로 로그인 페이지로 이동
        if (errorType === "auth" && redirectToLogin) {
            const timeout = setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [errorType, autoRetry, redirectToLogin, navigate]);

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
                className="w-[50vw] sm:w-[20vw] h-auto mb-4"
            />

            {/* 에러 메시지 */}
            <div className="animate-pulse">
                <h1 className="text-2xl font-bold my-2">{title}</h1>
                <p className="max-w-xs text-linkleGray whitespace-pre-line my-1">{description}</p>
            </div>

            {errorType === "server" && (
                <Link to='/' replace className='text-sm font-medium text-black/40 hover:text-black/45 mt-5'>
                    홈으로 돌아가기
                </Link>
            )}

        </div>
    );
}
