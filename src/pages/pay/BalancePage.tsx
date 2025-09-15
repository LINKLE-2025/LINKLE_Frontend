// src/pages/BalanceControl.tsx
import React, { useState, useEffect } from "react";
import { ArrowUpCircle, ArrowDownCircle, PlusCircle } from "lucide-react";
import { getCurrentUserInfo } from "@/api/authApi";
import { getBalance, getBalanceHistory, withdrawBalance } from "@/api/payApi";
import * as PortOne from "@portone/browser-sdk/v2";

const BalanceControl = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const info = await getCurrentUserInfo();
                setUserId(String(info.userId));
                await refreshData(String(info.userId));
            } catch (err) {
                console.error("데이터 불러오기 실패:", err);
            }
        })();
    }, []);

    const refreshData = async (id: string) => {
        try {
            const bal = await getBalance(id);
            const hist = await getBalanceHistory(id);
            setBalance(bal.balance);
            setHistory(hist);
        } catch (err) {
            console.error("잔액/내역 불러오기 실패:", err);
        }
    };

    // ✅ 충전 (결제 요청만 → 완료는 PayRedirectPage에서 처리)
    const handleCharge = async () => {
        if (!userId) return alert("로그인이 필요합니다.");
        if (amount <= 0) return alert("1원 이상 입력해주세요.");

        setLoading(true);
        try {
            const paymentId = `payment-${crypto.randomUUID()}`;
            await PortOne.requestPayment({
                storeId: import.meta.env.VITE_PORTONE_STORE_ID,
                channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
                paymentId,
                orderName: "포인트 충전",
                totalAmount: amount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                redirectUrl: `${window.location.origin}/pay`, // 👉 여기로 리다이렉트
            });
        } catch (err) {
            console.error("결제 에러:", err);
            alert("결제 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!userId) return;
        if (amount <= 0) return alert("출금 금액을 입력하세요.");
        setLoading(true);
        try {
            await withdrawBalance(userId, amount);
            refreshData(userId);
        } catch {
            alert("출금 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 p-4 sm:p-6 space-y-6">
            {/* 💰 잔액 */}
            <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-500 mb-2">현재 잔액</h3>
                <p className="text-3xl font-bold text-indigo-600">
                    {balance !== null ? balance.toLocaleString() : "로딩중..."} P
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="금액 입력"
                    />
                    <div className="flex flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleCharge}
                            disabled={loading}
                            className="flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition w-full sm:w-auto"
                        >
                            <PlusCircle size={18} /> 충전
                        </button>
                        <button
                            onClick={handleWithdraw}
                            disabled={loading}
                            className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition w-full sm:w-auto"
                        >
                            <ArrowDownCircle size={18} /> 출금
                        </button>
                    </div>
                </div>
            </div>

            {/* 📜 입출금 내역 */}
            <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ArrowUpCircle className="text-indigo-500" size={20} />
                    입출금 내역
                </h3>
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center">내역이 없습니다.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {history.map((item) => (
                            <li key={item.accountId} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <span className="text-gray-700">{item.memo}</span>
                                <span
                                    className={`px-2 py-1 rounded-lg text-sm ${item.amount > 0
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {item.amount > 0 ? "+" : ""}
                                    {item.amount.toLocaleString()} P
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {new Date(item.createdDate).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BalanceControl;
