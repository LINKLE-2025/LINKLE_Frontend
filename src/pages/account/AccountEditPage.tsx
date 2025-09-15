import BankButton from "@/components/account/BankButton";
import { useState } from "react";

export default function AccountEditPage() {
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [accountNumber, setAccountNumber] = useState<string>("");

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
            <div className="w-full border bg-white p-5 rounded-xl space-y-4">
                <div className="flex text-lg font-bold justify-between border-b">
                    <p>계좌 정보</p>
                </div>
                <div className="flex flex-col space-y-3">
                    {/* 은행사 선택 */}
                    <div className="w-full marker:items-start justify-start text-left">
                        <p className="text-sm text-linkleGray font-bold pl-1 mb-1">은행사</p>
                        <input type="text" placeholder="하단에서 은행사를 선택해주세요" readOnly
                            value={selectedBank ? selectedBank : ""}
                            className="w-full text-linkleGray font-bold
                                    bg-gray-100/40 border border-gray-200 rounded-lg 
                                    focus:outline-none focus:border-black/15 px-3 py-2.5"
                        />
                    </div>
                    {/* 계좌번호 입력 */}
                    <div className="w-full marker:items-start justify-start text-left">
                        <p className="text-sm text-linkleGray font-bold pl-1 mb-1">계좌번호</p>
                        <input type="text" placeholder={`${selectedBank ? banks.find(bank => bank.name === selectedBank)?.placeholder : "계좌번호를 입력해주세요"}`}
                            className="w-full text-linkleGray border border-gray-200 rounded-lg
                        bg-gray-100/40
                        focus:outline-none focus:border-black/15 px-3 py-2.5"
                        />
                    </div>
                </div>
                {/* 수정 버튼 */}
                <div className="flex justify-around space-x-4 px-2">
                    <button className="w-screen max-w-48 border rounded-lg bg-gray-100/20 hover:bg-gray-100/60 py-1.5 mt-2"
                        onClick={() => {
                            alert("계좌 수정");
                            // TODO: 계좌 수정 로직 추가
                            console.log("수정된 은행사:", selectedBank);
                            console.log("수정된 계좌번호:", accountNumber);
                        }}>
                        <p>수정</p>
                    </button>
                </div>
            </div>
            {/* 하단 컨텐츠 */}
            <div className="flex-1 w-full border bg-white p-5 rounded-xl space-y-5">
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
                                setSelectedBank(bank.name);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div >
    );
}