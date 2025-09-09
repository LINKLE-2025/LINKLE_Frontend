import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import LandingPage from "./LandingPage";
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function LandingRedirect() {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                await apiClient.get("/auth/me");
                console.log("✅ 로그인 성공");
                setLoggedIn(true);
            } catch (err) {
                console.warn("❌ 로그인 실패", err);
                setLoggedIn(false);
            } finally {
                console.log("🔥 finally 실행됨");
                setTimeout(() => {
                    console.log("⏳ setLoading(false) 실행");
                    setLoading(false);
                }, 1000);
            }
        };

        checkLogin();
    }, []);

    if (loggedIn !== null && loading) {
        return <FullScreenLoader />; // ✅ 스플래시 화면
    }


    return loggedIn ? <Navigate to="/map" replace /> : <LandingPage />;
}
