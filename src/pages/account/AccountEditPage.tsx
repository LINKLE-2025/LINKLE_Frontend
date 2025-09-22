import BankButton from "@/components/account/BankButton";
import { getCurrentUserInfo } from "@/api/authApi";
import { getBalance } from "@/api/payApi";
import apiClient from "@/api/apiClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountEditPage() {
    const navigate = useNavigate();
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [accountNumber, setAccountNumber] = useState<string>("");
    const [userId, setUserId] = useState<string | null>(null);
    const [bankId, setBankId] = useState<number | null>(null);
    const bankNames: Record<number, string> = {
        1: "신한은행",
        2: "KB국민은행",
        3: "하나은행",
        4: "우리은행",
        5: "NH농협은행",
        6: "IBK기업은행",
        7: "카카오뱅크",
        8: "토스뱅크",
        9: "케이뱅크",
    };
    // 로그인한 사용자 정보 가져오기
    useEffect(() => {
        (async () => {
            try {
                const info = await getCurrentUserInfo();
                setUserId(String(info.userId));
                const bal = await getBalance(String(info.userId));
                setAccountNumber(bal.accountNumber || "");
                setBankId(bal.bankId || null);
                setSelectedBank(bal.bankId ? banks.find(bank => bank.name === bankNames[bal.bankId])?.name || null : null);
            } catch (err) {
                console.error("데이터 불러오기 실패:", err);
            }
        })();
    }, []);


    // ✅ 계좌 수정 API 호출 함수
    const handleUpdateAccount = async () => {
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!accountNumber || !bankId) {
            alert("은행과 계좌번호를 모두 입력해주세요.");
            return;
        }

        try {
            const response = await apiClient.patch(`/balance/${userId}/update`, {
                accountNumber,
                bankId,
            });
            console.log("계좌 수정 결과:", response.data);
            alert("계좌 정보가 수정되었습니다.");
            // 계좌 관리 페이지로 이동
            navigate("/profile/account");
        } catch (error: any) {
            console.error("계좌 수정 실패:", error);
            alert(error.response?.data?.error || "계좌 수정 실패");
        }
    };

    // 계좌번호 입력 핸들러 - 숫자만 입력 & 포맷 적용 + 삭제 가능
    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const onlyDigits = input.replace(/\D/g, ""); // 숫자만 추출

        const format = banks.find(bank => bank.name === selectedBank)?.placeholder;
        if (!format) {
            setAccountNumber(onlyDigits);
            return;
        }

        const maxDigits = (format.match(/0/g) || []).length;
        const digits = onlyDigits.slice(0, maxDigits);

        let formatted = "";
        let digitIndex = 0;

        for (const char of format) {
            if (char === "0") {
                if (digitIndex < digits.length) {
                    formatted += digits[digitIndex++];
                } else {
                    break;
                }
            } else {
                // 하이픈은 숫자가 있을 때만 추가
                if (digitIndex > 0 && digitIndex < digits.length) {
                    formatted += char;
                }
            }
        }

        setAccountNumber(formatted);
    };


    // 은행사 리스트
    const banks = [
        {
            name: "신한은행",
            symbol: "/icons/account/Shinhan_Symbol.png",
            wordmark: "/icons/account/Shinhan_Wordmark.png",
            placeholder: "000-000-000000",
            colors: { border: "border-blue-200", bg: "bg-blue-50/70" },
        },
        {
            name: "KB국민은행",
            symbol: "/icons/account/KB_Symbol.png",
            wordmark: "/icons/account/KB_Wordmark.png",
            placeholder: "000000-00-000000",
            colors: { border: "border-yellow-200", bg: "bg-yellow-50/70" },
        },
        {
            name: "하나은행",
            symbol: "/icons/account/Hana_Symbol.png",
            wordmark: "/icons/account/Hana_Wordmark.png",
            placeholder: "000-000-000000",
            colors: { border: "border-teal-200", bg: "bg-teal-50/70" },
        },
        {
            name: "우리은행",
            symbol: "/icons/account/Woori_Symbol.png",
            wordmark: "/icons/account/Woori_Wordmark.png",
            placeholder: "0000-000-000000",
            colors: { border: "border-sky-200", bg: "bg-sky-50/70" },
        },
        {
            name: "NH농협은행",
            symbol: "/icons/account/NH_Symbol.png",
            wordmark: "/icons/account/NH_Wordmark.png",
            placeholder: "000-0000-0000-00",
            colors: { border: "border-green-200", bg: "bg-green-50/70" },
        },
        {
            name: "IBK기업은행",
            symbol: "/icons/account/IBK_Symbol.png",
            wordmark: "/icons/account/IBK_Wordmark.png",
            placeholder: "000-00-0000000",
            colors: { border: "border-sky-200", bg: "bg-sky-50/70" },
        },
        {
            name: "카카오뱅크",
            symbol: "/icons/account/Kakao_Symbol.png",
            wordmark: "/icons/account/Kakao_Wordmark.png",
            placeholder: "0000-00-0000000",
            colors: { border: "border-yellow-200", bg: "bg-yellow-50/70" },
        },
        {
            name: "토스뱅크",
            symbol: "/icons/account/Toss_Symbol.png",
            wordmark: "/icons/account/Toss_Wordmark.png",
            placeholder: "0000-0000-0000",
            colors: { border: "border-blue-200", bg: "bg-blue-50/70" },
        },
        {
            name: "케이뱅크",
            symbol: "/icons/account/Kbank_Symbol.png",
            wordmark: "/icons/account/Kbank_Wordmark.png",
            placeholder: "000-000-000000",
            colors: { border: "border-indigo-200", bg: "bg-indigo-50/70" },
        },
    ];


    // 페이지 렌더링
    return (
        <div className="flex flex-col flex-1 w-full bg-blue-50/40 items-center gap-4 p-4">
            {/* 상단 컨텐츠 */}
            <div className="w-full max-w-2xl border bg-white p-5 rounded-xl space-y-4 shadow-sm">
                <div className="flex text-lg font-bold justify-between border-b">
                    <p>계좌 정보</p>
                </div>
                <div className="flex flex-col space-y-3">
                    {/* 은행사 선택 */}
                    <div className="w-full marker:items-start justify-start text-left">
                        <p className="text-sm text-linkleGray font-bold pl-1 mb-1">은행사</p>
                        <input type="text" placeholder="하단에서 은행사를 선택해주세요" readOnly
                            value={selectedBank ? selectedBank : ""}
                            className="w-full text-linkleGray
                                    bg-gray-100/40 border border-gray-200 rounded-lg 
                                    focus:outline-none focus:border-black/15 px-3 py-2.5"
                        />
                    </div>
                    {/* 계좌번호 입력 */}
                    <div className="w-full marker:items-start justify-start text-left">
                        <p className="text-sm text-linkleGray font-bold pl-1 mb-1">계좌번호</p>
                        <input
                            type="text"
                            placeholder={
                                selectedBank
                                    ? banks.find(bank => bank.name === selectedBank)?.placeholder
                                    : "계좌번호를 입력해주세요"
                            }
                            value={accountNumber}
                            onChange={handleAccountNumberChange} // ✅ 변경
                            className="w-full text-linkleGray border border-gray-200 rounded-lg
        bg-gray-100/40
        focus:outline-none focus:border-black/15 px-3 py-2.5"
                        />
                    </div>
                </div>
                {/* 수정 버튼 */}
                <div className="flex justify-around space-x-4 px-2">
                    <button className="w-screen max-w-48 border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5 mt-2"
                        onClick={handleUpdateAccount}>
                        <p>수정</p>
                    </button>
                </div>
            </div>
            {/* 하단 컨텐츠 */}
            <div className="flex-1 w-full max-w-2xl border bg-white p-5 rounded-xl space-y-5 shadow-sm">
                <div className="flex text-lg font-bold justify-between border-b">
                    <p>은행사 선택</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {/* 은행사 리스트 */}
                    {banks.map((bank) => (
                        <BankButton
                            key={bank.name}
                            symbolSrc={bank.symbol}
                            wordmarkSrc={bank.wordmark}
                            alt={bank.name}
                            selected={selectedBank === bank.name}
                            colors={bank.colors}
                            onClick={() => {
                                setSelectedBank(bank.name); // UI 표시용
                                setBankId(banks.indexOf(bank) + 1); // 숫자 ID 설정 (1~9)
                                setAccountNumber(""); // ✅ 계좌번호 초기화
                                console.log("선택된 은행사:", bank.name, "ID:", banks.indexOf(bank) + 1);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div >
    );
}