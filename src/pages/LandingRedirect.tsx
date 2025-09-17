import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./LandingPage";
import FullScreenLoader from "@/components/common/FullScreenLoader";
import { getCurrentUserInfo } from "@/api/authApi";

export default function LandingRedirect() {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // 컴포넌트 마운트 시 로그인 상태 확인
    useEffect(() => {
        const checkLogin = async () => {
            try {
                console.log("🔄 로그인 상태 확인 중...");
                await getCurrentUserInfo();
                console.log("✅ 로그인 성공");
                setLoggedIn(true);
            } catch (err) {
                console.warn("❌ 로그인 실패", err);
                setLoggedIn(false);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };

        checkLogin();
    }, []);

    // 로딩 중일 때 로더 표시
    if (loading) {
        return <FullScreenLoader />;
    }

    return loggedIn ? <Navigate to="/map" replace /> : <LandingPage />;
}
