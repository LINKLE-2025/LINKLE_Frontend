import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { chargeComplete } from "@/api/payApi";
import { getCurrentUserInfo } from "@/api/authApi";

const PayRedirectPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const calledRef = useRef(false); // ✅ 렌더링 사이에서도 값 유지

    useEffect(() => {
        const handlePayment = async () => {
            if (calledRef.current) return; // 이미 실행했으면 종료
            calledRef.current = true;

            try {
                const paymentId = searchParams.get("paymentId");
                if (!paymentId) {
                    setMsg("결제 식별자가 없습니다.");
                    setLoading(false);
                    return;
                }

                const user = await getCurrentUserInfo();
                const userId = user.userId;

                await chargeComplete(paymentId, userId);
                console.log("[FRONT] chargeComplete 요청 보냄:", paymentId, userId);

                setMsg("충전 성공!");
            } catch (err) {
                console.error("결제 확인 실패:", err);
                setMsg("결제 검증 실패");
            } finally {
                setLoading(false);
                setTimeout(() => {
                    navigate("/balance");
                }, 2000);
            }
        };
        handlePayment();
    }, [searchParams, navigate]);


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                {loading ? (
                    <p className="text-lg font-semibold text-gray-700">결제 확인 중...</p>
                ) : (
                    <p className="text-lg font-semibold text-indigo-600">{msg}</p>
                )}
            </div>
        </div>
    );
};

export default PayRedirectPage;
