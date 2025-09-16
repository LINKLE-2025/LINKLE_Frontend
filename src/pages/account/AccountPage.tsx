import { useActionMenu } from "@/components/modal/useActionMenu";
import { EllipsisVertical, RotateCw, Settings } from "lucide-react"
import { useState, useEffect } from "react";
import { getCurrentUserInfo } from "@/api/authApi";
import { getBalance, getBalanceHistory, withdrawBalance } from "@/api/payApi";
import * as PortOne from "@portone/browser-sdk/v2";
import apiClient from "@/api/apiClient";



interface HistoryItem {
    accountId: number;
    memo: string;
    amount: number;
    createdDate: string;
}


export default function AccountPage() {
    const [showOptions, setShowOptions] = useState(false);
    const [amount, setAmount] = useState(0);
    const { open: openMenu, confirm, ActionMenu } = useActionMenu();
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [accountNumber, setAccountNumber] = useState<string>("");
    const [bankId, setBankId] = useState<number>(1); // 은행 ID (예: 1: 신한은행, 2: 국민은행 등)
    const bankNames: Record<number, string> = {
        1: "신한",
        2: "국민",
        3: "하나",
        4: "우리",
        5: "농협",
        6: "기업",
        7: "카카오",
        8: "토스",
        9: "케이뱅크",
    };
    // bankId → 이미지 파일 매핑
    const bankImages: Record<number, string> = {
        1: "/icons/account/Shinhan_Symbol.png",
        2: "/icons/account/KB_Symbol.png",
        3: "/icons/account/Hana_Symbol.png",
        4: "/icons/account/Woori_Symbol.png",
        5: "/icons/account/NH_Symbol.png",
        6: "/icons/account/IBK_Symbol.png",
        7: "/icons/account/Kakao_Symbol.png",
        8: "/icons/account/Toss_Symbol.png",
        9: "/icons/account/Kbank_Symbol.png",
    };

    useEffect(() => {
        (async () => {
            try {
                const info = await getCurrentUserInfo();
                setUserId(String(info.userId));
                setName(info.name);
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
            const accountNum = bal.accountNumber;
            const bankId = bal.bankId;
            setBankId(bankId ?? 0);
            setAccountNumber(accountNum ?? "");
            setBalance(bal.balance ?? 0);
            setHistory(hist ?? []);
        } catch (err) {
            console.error("잔액/내역 불러오기 실패:", err);
        }
    };

    const onEditProfile = async () => {
        await openMenu({
            title: "계좌 관리",
            actions: [
                {
                    id: "edit",
                    label: "계좌 수정",
                    type: "link",
                    href: `/profile/account/edit`,
                    icon: <Settings className="h-5 w-5" />,
                },
            ],
            cancelText: "",
            closeOnOverlay: true,
        });
    };

    const handleCharge2 = async () => {
        if (!userId) return alert("로그인이 필요합니다.");
        if (amount <= 0) return alert("1원 이상 입력해주세요.");

        setLoading(true);
        try {
            const paymentId = `payment-${crypto.randomUUID()}`;

            // 포트원 결제 요청 (팝업)
            await PortOne.requestPayment({
                storeId: import.meta.env.VITE_PORTONE_STORE_ID,
                channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
                paymentId,
                orderName: "포인트 충전",
                totalAmount: amount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                redirectUrl: `${window.location.origin}/pay`, // 👉 여기로 리다이렉트
                // redirectUrl는 사실 필요 없음, 백엔드에서 바로 처리
            });

            // 팝업이 닫히고 나면 서버에서 결제 상태 확인 & DB 업데이트
            const res = await apiClient.post("/balance/charge", { paymentId, userId, amount });
            if (res.data.msg === "충전 성공") {
                alert("충전 완료!");
                setBalance((prev) => (prev ?? 0) + amount);
                setHistory((prev) => [
                    {
                        accountId: 0,
                        memo: "계좌 충전",
                        amount,
                        createdDate: new Date().toISOString(),
                    },
                    ...prev,
                ]);
            } else {
                console.error("충전 API 응답:", res.data);
                alert("충전 실패");
            }

        } catch (err) {
            console.error(err);
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
            await withdrawBalance(userId, amount, "잔액 출금");
            refreshData(userId);
        } catch {
            alert("출금 실패");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex flex-col flex-1 w-full bg-blue-50/40 items-center gap-4 p-4">
            {/* 상단 컨텐츠 */}
            <div className="w-full max-w-2xl border bg-white p-5 rounded-xl space-y-6 shadow-sm">
                {/* 계좌 정보 */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-row items-center">
                        {/* 은행사별 동적 아이콘 */}
                        {bankId ? (
                            <img
                                className="w-9 h-9 rounded-full mr-3"
                                src={bankImages[bankId] || "/icons/account/Default_Bank.png"}
                                alt={`${bankNames[bankId] || "은행"} 아이콘`}
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full mr-3 bg-gray-200/60" />
                        )}

                        <div className="flex flex-col items-start">
                            <p className="text-sm">
                                <span className="font-bold">{name || "사용자"}</span>님의 계좌
                            </p>
                            <p className="text-xs text-black/50">
                                {bankId ? `${bankNames[bankId] || "알수없음"} ${accountNumber}` : "계좌를 등록해주세요"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onEditProfile} className="p-2 rounded-xl hover:bg-gray-100/80">
                        <EllipsisVertical />
                    </button>
                </div>
                {/* 잔액 */}
                <div className="flex flex-row items-center space-x-0.5">
                    <h1 className="text-2xl xxs:text-3xl font-bold">{balance !== null ? balance.toLocaleString() : "0"}원</h1>
                    <div onClick={() => alert("잔액 새로고침")} className="p-1.5 text-gray-400 hover:text-linkleGray hover:bg-gray-100/80 rounded-xl cursor-pointer">
                        <RotateCw strokeWidth={2} />
                    </div>
                </div>
                {/* 입출금 버튼 */}
                <div className="flex justify-around space-x-4 px-2">
                    {!showOptions ? (
                        // 처음에는 "입출금" 버튼만 보임
                        <button
                            className="w-screen border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5"
                            onClick={() => setShowOptions(true)}
                        >
                            <p>입출금</p>
                        </button>
                    ) : (
                        // "입금" "출금" 버튼과 input이 나타남
                        <div className="flex flex-col w-full space-y-3">
                            <input type="number" placeholder="100원 이상 입력하세요"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full text-linkleGray
                                    bg-gray-100/5 border border-gray-200 rounded-lg 
                                    focus:outline-none focus:border-black/15 px-3 py-2.5"
                            />
                            <div className="flex justify-around space-x-4">
                                <button
                                    className="w-screen border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5"
                                    onClick={() => handleCharge2()}
                                >
                                    <p>입금</p>
                                </button>
                                <button
                                    className="w-screen border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5"
                                    onClick={() => handleWithdraw()}
                                >
                                    <p>출금</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* 하단 컨텐츠 */}
            <div className="flex-1 w-full max-w-2xl border bg-white p-5 rounded-xl space-y-5 shadow-sm">
                <div className="flex text-lg font-bold justify-between border-b">
                    <p>입출금 내역 조회</p>
                </div>
                <div className="flex flex-col space-y-6">
                    {history.length === 0 ? (
                        <p className="text-gray-500 text-center">내역이 없습니다.</p>
                    ) : (
                        history.map((item) => (
                            <div key={item.accountId} className="flex justify-between">
                                {/* 좌측: 날짜 + 메모 */}
                                <div className="flex flex-col items-start text-left">
                                    <p className="text-xs text-black/50">
                                        {new Date(item.createdDate).toLocaleString()}
                                    </p>
                                    <p className="xxs:text-lg">{item.memo}</p>
                                </div>

                                {/* 우측: 입금/출금 + 금액 */}
                                <div className="flex flex-col items-end text-right">
                                    <p
                                        className={`text-xs font-bold ${item.amount > 0 ? "text-blue-600/90" : "text-red-600/90"
                                            }`}
                                    >
                                        {item.amount > 0 ? "입금" : "출금"}
                                    </p>
                                    <p
                                        className={`xxs:text-lg font-bold ${item.amount > 0 ? "text-blue-600/90" : "text-red-600/90"
                                            }`}
                                    >
                                        {item.amount.toLocaleString()}원
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {ActionMenu}
        </div >

    );
}
