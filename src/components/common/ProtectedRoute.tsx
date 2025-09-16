import { Navigate } from "react-router-dom";
import { JSX, useEffect, useState } from "react";
import { getCurrentUserInfo } from "@/api/authApi";
import FullScreenLoader from "./FullScreenLoader";

// ProtectedRoute : 로그인된 사용자만 접근 가능
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    // 마운트 시 1회만 실행
    useEffect(() => {
        const checkLogin = async () => {
            try {
                // 로그인 성공 시
                await getCurrentUserInfo();
                setLoggedIn(true);
            } catch {
                // 로그인 실패 시
                setLoggedIn(false);
            }
        };
        checkLogin();
    }, []);

    // 로딩 중이거나 로그인 상태가 아직 결정되지 않은 경우 로더 표시
    if (loggedIn === null) return <FullScreenLoader />;
    if (!loggedIn) return <Navigate to="/login" replace />;

    // 로그인된 경우 자식 컴포넌트 렌더링
    return children;
}