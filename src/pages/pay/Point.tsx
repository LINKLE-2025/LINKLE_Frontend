import { getCurrentUserId } from "@/api/authApi";
import React, { useState, useEffect, use } from "react";
import { ArrowUpCircle, ArrowDownCircle, PlusCircle } from "lucide-react";

type HistoryItem = {
    accountId: number;
    amount: number;
    memo: string;
    createdDate: string;
};

type UserInfo = {
    userId: number;
    email: string;
    name: string;
}




const BalanceControl = () => {
    const [userId, setCurrentUserId] = useState<string | null>(null);

    //아임포트.js 동적 로딩
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);


    useEffect(() => {
        (async () => {
            try {
                const userId = await getCurrentUserId();
                setCurrentUserId(String(userId));
            } catch (e) {
                console.error("현재 사용자 정보 불러오기 실패", e);
            }
        })();
    }, []);


    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (!userId) return;

        fetch(`https://192.168.0.129:7777/api/users/${userId}`)
            .then((res) => res.json())
            .then((data) => setUserInfo(data))
            .catch((err) => console.error("유저 정보 불러오기 실패:", err));
    }, [userId]);

    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (!userId) return;

        fetch(`https://192.168.0.129:7777/api/balance/${userId}`)
            .then((res) => res.json())
            .then((data) => setBalance(data.balance));

        fetch(`https://192.168.0.129:7777/api/balance/${userId}/history`)
            .then((res) => res.json())
            .then((data) => setHistory(data));
    }, [userId]);

    const refreshData = async (userId: string) => {
        const [balanceRes, historyRes] = await Promise.all([
            fetch(`https://192.168.0.129:7777/api/balance/${userId}`).then((res) =>
                res.json()
            ),
            fetch(
                `https://192.168.0.129:7777/api/balance/${userId}/history`
            ).then((res) => res.json()),
        ]);
        setBalance(balanceRes.balance);
        setHistory(historyRes);
    };


    // 아임포트 연동(충전)
    const handleCharge = async () => {
        if (!userId) return;

        if (!window.IMP) {
            alert("결제 모듈이 아직 로드되지 않았습니다.");
            return;
        }

        const { IMP } = window;
        IMP.init("imp82813442");//현재는 테스트모드 이므로, 샘플키 사용 

        IMP.request_pay(
            {
                pg: "tosspayments", //테스트 모드
                pay_method: "card",
                merchant_uid: `mid_${new Date().getTime()}`,
                name: "포인트 충전",
                amount: amount,
                buyer_email: userInfo?.email || "",
                buyer_name: userInfo?.name || "",

                m_redirect_url: "http://192.168.0.129.:3000/pay", //모바일 결제 후 리다이렉트 주소
            },
            async (rsp: any) => {
                if (rsp.success) {
                    // 결제 서버 검증 호출
                    await fetch("https://192.168.0.129:7777/api/balance/charge-complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            imp_uid: rsp.imp_uid,
                            paid_amount: rsp.paid_amount,
                        }),
                    });
                    refreshData(userId);
                } else {
                    alert("결제 실패: " + rsp.error_msg);
                }
            }
        );
    };
    const handleWithdraw = async () => {
        if (!userId) return;
        const res = await fetch(
            `https://192.168.0.129:7777/api/balance/${userId}/balance`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: -amount }),
            }
        );
        const data = await res.json();
        if (!data.error) {
            refreshData(userId);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 p-4 sm:p-6 space-y-6">
            {/* 💰 잔액 카드 */}
            <div className="w-[100%] sm:max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-500 mb-2">현재 잔액</h3>
                <p className="text-3xl font-bold text-indigo-600">
                    {balance !== null ? balance.toLocaleString() : "로딩중..."} P
                </p>

                {/* 입력 + 버튼 */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="금액 입력"
                    />
                    <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleCharge}
                            className="flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg transition w-full sm:w-auto"
                        >
                            <PlusCircle size={18} /> 충전
                        </button>
                        <button
                            onClick={handleWithdraw}
                            className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition w-full sm:w-auto"
                        >
                            <ArrowDownCircle size={18} /> 출금
                        </button>
                    </div>
                </div>
            </div>

            {/* 📜 입출금 내역 */}
            <div className="w-[100%] sm:max-w-md bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ArrowUpCircle className="text-indigo-500" size={20} />
                    입출금 내역
                </h3>
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center">내역이 없습니다.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {history.map((item) => (
                            <li
                                key={item.accountId}
                                className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"
                            >
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
