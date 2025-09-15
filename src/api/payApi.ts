// src/api/payApi.ts

import apiClient from "./apiClient";

/** 잔액 */
export const getBalance = async (userId: string) => {
  const res = await apiClient.get(`/balance/${userId}`, { withCredentials: true });
  return res.data;
};

/** 입출금 내역 */
export const getBalanceHistory = async (userId: string) => {
  const res = await apiClient.get(`/balance/${userId}/history`, { withCredentials: true });
  return res.data;
};

/** 충전 완료 처리 (V2) */
export const chargeComplete = async (paymentId: string, userId: number) => {
  console.log("[API CALL] chargeComplete 실행:", paymentId, userId); // ✅ 찍기

  const res = await apiClient.post(
    `/balance/charge-complete`,
    { paymentId, userId }, // ✅ imp_uid, paid_amount ❌
    { withCredentials: true },
  );
  return res.data;
};

/** 출금 */
export const withdrawBalance = async (userId: string, amount: number, memo: string) => {
  const res = await apiClient.patch(
    `/balance/${userId}/withdraw`,
    { amount: -Math.abs(amount), memo }, //항상 음수로 전송
    { withCredentials: true },
  );
  return res.data;
};
