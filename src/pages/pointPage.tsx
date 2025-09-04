import React, { useEffect, useState } from "react";

type TxType = "CHARGE" | "USE" | "REFUND" | "IN" | "OUT";

interface AccountSummary {
  accountNo: string;
  balance: number;
}

interface TxItem {
  id: number;
  type: TxType;
  amount: number; // 입금: 양수, 출금: 음수
  balanceAfter: number;
  createdAt: string; // ISO 문자열
  memo?: string | null;
}

const USER_ID = 1;

export default function AccountPage() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [history, setHistory] = useState<TxItem[]>([]);
  const [err, setErr] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fmtNumber = (n: number) => n.toLocaleString();
  const fmtDate = (s: string) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString();
  };

  const load = async () => {
    setErr("");
    try {
      const [sRes, hRes] = await Promise.all([
        fetch(`/api/account/summary?userId=${USER_ID}`),
        fetch(`/api/account/history?userId=${USER_ID}`),
      ]);
      if (!sRes.ok) throw new Error("요약 조회 실패");
      if (!hRes.ok) throw new Error("내역 조회 실패");
      setSummary(await sRes.json());
      setHistory(await hRes.json());
    } catch (e: any) {
      setErr(e.message ?? "네트워크 오류");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const post = async (path: string, amount: number) => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`/api/account/${path}?userId=${USER_ID}&amount=${amount}`, {
        method: "POST",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "요청 실패");
      }
      await load();
    } catch (e: any) {
      setErr(e.message ?? "요청 처리 중 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    await post("deposit", depositAmount);
    setDepositAmount(0);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;
    if (summary && withdrawAmount > summary.balance) {
      setErr("잔액을 초과했습니다.");
      return;
    }
    await post("withdraw", withdrawAmount);
    setWithdrawAmount(0);
  };

  return (
    <div className='mx-auto max-w-3xl p-6'>
      <h2 className='mb-3 text-2xl font-semibold'>계좌 현황</h2>

      {err && (
        <div className='mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          ⚠️ {err}
        </div>
      )}

      {/* 요약 카드 */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-gray-600'>계좌번호</span>
          <strong className='font-semibold'>{summary?.accountNo ?? "-"}</strong>
        </div>
        <div className='mt-2 flex items-center justify-between'>
          <span className='text-gray-600'>잔액</span>
          <strong className='text-lg'>{summary ? `${fmtNumber(summary.balance)} P` : "-"}</strong>
        </div>
      </div>

      {/* 입금 / 출금 */}
      <div className='mb-6 grid gap-3 sm:grid-cols-2'>
        {/* 입금 */}
        <form onSubmit={handleDeposit} className='rounded-xl border border-gray-200 p-4'>
          <div className='mb-3 text-base font-semibold'>입금</div>
          <div className='flex gap-2'>
            <input
              type='number'
              inputMode='numeric'
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              placeholder='금액'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500'
            />
            <button
              type='submit'
              disabled={loading || depositAmount <= 0}
              className={`rounded-lg border px-4 py-2 text-sm ${
                loading || depositAmount <= 0
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              {loading ? "처리중..." : "입금하기"}
            </button>
          </div>
        </form>

        {/* 출금 */}
        <form onSubmit={handleWithdraw} className='rounded-xl border border-gray-200 p-4'>
          <div className='mb-3 text-base font-semibold'>출금</div>
          <div className='flex gap-2'>
            <input
              type='number'
              inputMode='numeric'
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              placeholder='금액'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500'
            />
            <button
              type='submit'
              disabled={
                loading ||
                withdrawAmount <= 0 ||
                (summary ? withdrawAmount > summary.balance : true)
              }
              className={`rounded-lg border px-4 py-2 text-sm ${
                loading ||
                withdrawAmount <= 0 ||
                (summary ? withdrawAmount > summary.balance : true)
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              {loading ? "처리중..." : "출금하기"}
            </button>
          </div>
          {summary && withdrawAmount > summary.balance && (
            <p className='mt-2 text-xs text-red-600'>잔액을 초과했어요.</p>
          )}
        </form>
      </div>

      {/* 내역 테이블 */}
      <h3 className='mb-2 text-lg font-semibold'>입출금내역</h3>
      <div className='overflow-hidden rounded-xl border border-gray-200'>
        <div className='grid grid-cols-[120px,1fr,120px,140px] gap-2 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 max-[560px]:grid-cols-2 max-[560px]:text-xs'>
          <div>일시</div>
          <div>구분/메모</div>
          <div className='text-right max-[560px]:hidden'>금액</div>
          <div className='text-right max-[560px]:hidden'>거래 후 잔액</div>
        </div>

        {history.length === 0 ? (
          <div className='px-4 py-5 text-sm text-gray-600'>내역이 없습니다.</div>
        ) : (
          history.map((tx) => (
            <div
              key={tx.id}
              className='grid grid-cols-[120px,1fr,120px,140px] items-center gap-2 border-t border-gray-200 px-3 py-2 max-[560px]:grid-cols-2 max-[560px]:text-sm'
            >
              <div className='text-xs text-gray-600'>{fmtDate(tx.createdAt)}</div>
              <div>
                <div className='font-medium'>
                  {tx.type === "IN" || tx.amount > 0 ? "입금" : "출금"}
                </div>
                {tx.memo && <div className='text-xs text-gray-500'>{tx.memo}</div>}
              </div>
              <div className='text-right text-sm font-semibold text-gray-900 max-[560px]:col-span-2'>
                <span className={`${tx.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {tx.amount > 0 ? "+" : ""}
                  {fmtNumber(tx.amount)} P
                </span>
              </div>
              <div className='text-right text-sm text-gray-700 max-[560px]:hidden'>
                {fmtNumber(tx.balanceAfter)} P
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
