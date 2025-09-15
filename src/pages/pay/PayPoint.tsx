import React, { useState } from "react";

declare global {
    interface Window {
        IMP: any;
    }
}

const PointCharge = () => {
    const [amount, setAmount] = useState(1000);

    const onClickCharge = () => {
        const { IMP } = window;
        IMP.init("가맹점식별코드");

        IMP.request_pay(
            {
                pg: "html5_inicis",
                pay_method: "card",
                merchant_uid: "charge_" + new Date().getTime(),
                name: "포인트 충전",
                amount: amount,
                buyer_email: "test@example.com",
                buyer_name: "홍길동",
                buyer_tel: "010-1234-5678",
            },
            async (rsp: any) => {
                if (rsp.success) {
                    // 서버에 충전 완료 요청
                    await fetch("http://localhost:7777/balance/charge-complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(rsp),
                    });
                    alert("충전 완료!");
                } else {
                    alert("결제 실패: " + rsp.error_msg);
                }
            }
        );
    };

    return (
        <div>
            <h3>포인트 충전</h3>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
            />
            <button onClick={onClickCharge}>충전하기</button>
        </div>
    );
};

export default PointCharge;
