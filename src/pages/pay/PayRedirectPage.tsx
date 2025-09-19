import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { chargeComplete } from "@/api/payApi";
import { getCurrentUserInfo } from "@/api/authApi";

const PayRedirectPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const calledRef = useRef(false);

    useEffect(() => {
        const handlePayment = async () => {
            if (calledRef.current) return;
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
                    navigate("/profile/account");
                }, 2000);
            }
        };
        handlePayment();
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col flex-1 w-full bg-blue-50/40 items-center justify-center p-4">
            {/* 카드 컨테이너 */}
            <div className="w-full max-w-2xl border bg-white p-8 rounded-xl shadow-sm space-y-4 text-center">
                <h1 className="text-xl font-bold text-linkleGray border-b pb-3">
                    결제 처리 중
                </h1>

                {loading ? (
                    <p className="text-lg font-semibold text-gray-700">
                        결제 확인 중...
                    </p>
                ) : (
                    <p
                        className={`text-lg font-bold ${msg.includes("성공")
                            ? "text-indigo-600"
                            : "text-red-500"
                            }`}
                    >
                        {msg}
                    </p>
                )}

                {!loading && (
                    <p className="text-sm text-gray-500">
                        잠시 후 잔액 페이지로 이동합니다...
                    </p>
                )}
            </div>
        </div>
    );
};

export default PayRedirectPage;
