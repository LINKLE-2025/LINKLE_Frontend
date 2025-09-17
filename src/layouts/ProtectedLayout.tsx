import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore"; // 전역 상태 관리 사용
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function ProtectedLayout() {
    const { user, loading } = useAuthStore();

    // 로딩 중일 때 로더 표시
    if (loading) { return <FullScreenLoader />; }

    // 로그인 안 된 상태면 로그인 페이지로 리다이렉트
    if (!user) {
        alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        return <Navigate to="/login" replace />;
    }

    // 로그인 성공 시 내부 라우트 랜더링
    return <Outlet />;
}
