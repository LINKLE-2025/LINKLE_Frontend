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
                setLoggedIn(true);
            } catch {
                setLoggedIn(false);
            } finally {
                // 최소 1초 동안 로딩 화면을 유지
                setTimeout(() => setLoading(false), 700);
            }
        };

        checkLogin();
    }, []);


    if (loading) {
        return <FullScreenLoader />; // ✅ 스플래시 화면
    }

    return loggedIn ? <Navigate to="/map" replace /> : <LandingPage />;
}
