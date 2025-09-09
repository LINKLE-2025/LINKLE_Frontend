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
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };

        checkLogin();
    }, []);

    if (loading) {
        return <FullScreenLoader />;
    }


    return loggedIn ? <Navigate to="/map" replace /> : <LandingPage />;
}
